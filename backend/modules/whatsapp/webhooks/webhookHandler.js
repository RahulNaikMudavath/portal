const WhatsappMessage = require("../models/Message");
const { getWhatsAppConfig, normalizePhoneNumber, parseMessageContent } = require("../utils/whatsappUtils");
const { emitWhatsAppEvents } = require("../socket/socketEvents");
const { findOrCreateConversation } = require("../services/conversationService");

/**
 * Verify webhook verification token from Meta
 * @param {string} mode - hub.mode sent by Meta
 * @param {string} token - hub.verify_token sent by Meta
 * @returns {boolean}
 */
const verifyMetaWebhook = (mode, token) => {
  const { verifyToken } = getWhatsAppConfig();
  return mode === "subscribe" && token === verifyToken;
};

/**
 * Process incoming Meta WhatsApp Cloud API webhook payload
 * @param {Object} body - Webhook body payload from Meta
 * @param {Object} [io] - Socket.io instance for real-time updates
 * @returns {Promise<Array>} List of saved message records
 */
const processMetaIncomingWebhook = async (body, io = null) => {
  if (body.object !== "whatsapp_business_account") {
    throw new Error("Invalid object type in webhook payload");
  }

  const processedMessages = [];

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value;

      // 1. Process incoming messages
      if (value && value.messages && value.messages.length > 0) {
        for (const msg of value.messages) {
          const metaMessageId = msg.id || "";
          const from = msg.from;
          const cleanPhone = normalizePhoneNumber(from);

          // Deduplication Check: Prevent duplicate processing if Meta retries
          if (metaMessageId) {
            const existingMessage = await WhatsappMessage.findOne({ metaMessageId });
            if (existingMessage) {
              console.log(`[MetaWhatsApp] Skipping duplicate message metaMessageId: ${metaMessageId}`);
              continue;
            }
          }

          // Contact Profile Details
          const contact = (value.contacts && value.contacts.find(c => c.wa_id === from)) || (value.contacts && value.contacts[0]);
          const name = (contact && contact.profile && contact.profile.name) ? contact.profile.name : `Customer (${from.slice(-4)})`;

          // Parse Content & Media
          const parsed = parseMessageContent(msg);

          // Find or create parent Conversation
          const conversation = await findOrCreateConversation(from, name);

          // Timestamp from Meta (seconds since epoch)
          const messageTimestamp = msg.timestamp ? new Date(parseInt(msg.timestamp, 10) * 1000) : new Date();

          // Create & Persist WhatsAppMessage
          const createdMessage = await WhatsappMessage.create({
            conversationId: conversation.conversationId,
            conversation: conversation._id,
            metaMessageId: metaMessageId,
            phoneNumber: cleanPhone || from,
            customerName: name,
            direction: "incoming",
            messageType: parsed.messageType,
            text: parsed.text,
            media: parsed.media,
            mediaUrl: parsed.mediaUrl,
            fileName: parsed.fileName,
            status: "received",
            createdAt: messageTimestamp
          });

          console.log(`💾 [MetaWebhook] Saved incoming message to DB: ${createdMessage._id} from: ${createdMessage.phoneNumber}`);

          // Update parent Conversation metrics & last message pointers
          conversation.lastMessage = parsed.text;
          conversation.lastMessageAt = messageTimestamp;
          conversation.lastMessageId = createdMessage._id;
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
          if (["closed", "archived"].includes(conversation.status)) {
            conversation.status = "open";
          }
          await conversation.save();

          // Emit Socket Events for real-time frontend update
          emitWhatsAppEvents(io, createdMessage, conversation);

          // Asynchronously trigger the AI and downstream pipelines
          processDownstreamPipeline(conversation, createdMessage, io).catch(err => {
            console.error("[Downstream Pipeline] Error:", err);
          });

          processedMessages.push(createdMessage);
        }
      }

      // 2. Process message delivery / read status updates
      if (value && value.statuses && value.statuses.length > 0) {
        for (const statusObj of value.statuses) {
          const status = statusObj.status;
          const metaMsgId = statusObj.id;
          const recipientId = statusObj.recipient_id;

          if (metaMsgId) {
            await WhatsappMessage.updateOne(
              { metaMessageId: metaMsgId },
              { $set: { status: status } }
            );
          } else if (recipientId && status) {
            await WhatsappMessage.updateMany(
              { phoneNumber: normalizePhoneNumber(recipientId), direction: "outgoing" },
              { $set: { status: status } }
            );
          }
        }
      }
    }
  }

  return processedMessages;
};

/**
 * Downstream processing pipeline:
 * WhatsApp incoming -> AI summary -> WorkRequest -> Engineer assignment -> Project link
 */
const processDownstreamPipeline = async (conversation, message, io) => {
  const { analyzeConversation } = require("../../../modules/ai/services/aiService");
  const WorkRequest = require("../../../modules/workrequests/models/WorkRequest");
  const Project = require("../../../modules/projects/models/Project");
  const User = require("../../../modules/users/models/User");
  const WhatsappMessage = require("../models/Message");

  // 1. Get full chat history for context
  const messages = await WhatsappMessage.find({
    $or: [
      { conversation: conversation._id },
      { conversationId: conversation.conversationId }
    ]
  }).sort({ createdAt: 1 });

  // 2. Run AI Summary Engine
  let aiAnalysis = null;
  try {
    aiAnalysis = await analyzeConversation(messages);
  } catch (err) {
    console.error("[Downstream Pipeline] AI Analysis failed:", err);
    return;
  }

  if (!aiAnalysis) return;

  // 3. Find or Create Work Request
  let workRequest = await WorkRequest.findOne({
    whatsappNumber: conversation.phoneNumber,
    status: { $in: ["new", "under-review", "assigned"] }
  });

  const conversationHistory = messages.map(m => ({
    sender: m.direction === "incoming" ? "Customer" : "Agent",
    message: m.text || "",
    messageType: m.messageType || "text",
    createdAt: m.createdAt
  }));

  // Map building type to project type enum
  let mappedProjectType = "Residential";
  if (aiAnalysis.buildingType) {
    const bt = aiAnalysis.buildingType.toLowerCase();
    if (bt.includes("commercial")) mappedProjectType = "Commercial";
    else if (bt.includes("industrial")) mappedProjectType = "Industrial";
    else if (bt.includes("renovation")) mappedProjectType = "Renovation";
    else if (bt.includes("interior")) mappedProjectType = "Interior";
    else if (bt.includes("other")) mappedProjectType = "Other";
  }

  // Map priority to priority enum
  let mappedPriority = "medium";
  if (aiAnalysis.priority) {
    const pr = aiAnalysis.priority.toLowerCase();
    if (["low", "medium", "high", "urgent"].includes(pr)) {
      mappedPriority = pr;
    }
  }

  const subjectText = aiAnalysis.subject || message.text || "WhatsApp Work Request";
  const descText = aiAnalysis.summaryText || message.text || "";

  if (workRequest) {
    workRequest.projectName = aiAnalysis.projectLinked || workRequest.projectName;
    workRequest.projectType = mappedProjectType || workRequest.projectType;
    workRequest.siteAddress = aiAnalysis.location || workRequest.siteAddress;
    workRequest.subject = subjectText;
    workRequest.description = descText;
    workRequest.estimatedBudget = aiAnalysis.budget || workRequest.estimatedBudget;
    workRequest.priority = mappedPriority;
    workRequest.aiSummary = aiAnalysis.summaryText || workRequest.aiSummary;
    workRequest.conversation = conversationHistory;
  } else {
    workRequest = new WorkRequest({
      customerName: conversation.customerName || "Customer",
      phoneNumber: conversation.phoneNumber,
      whatsappNumber: conversation.phoneNumber,
      source: "whatsapp",
      projectName: aiAnalysis.projectLinked || "",
      projectType: mappedProjectType,
      siteAddress: aiAnalysis.location || "",
      subject: subjectText,
      description: descText,
      estimatedBudget: aiAnalysis.budget || 0,
      priority: mappedPriority,
      aiSummary: aiAnalysis.summaryText || "",
      conversation: conversationHistory
    });
  }

  // 4. Engineer Assignment
  let engineerUser = null;
  if (aiAnalysis.engineerName) {
    engineerUser = await User.findOne({
      role: "engineer",
      name: { $regex: aiAnalysis.engineerName, $options: "i" }
    });
  }

  if (engineerUser) {
    workRequest.assignedEngineer = engineerUser._id;
    workRequest.status = "assigned";
  }

  await workRequest.save();
  console.log(`[Downstream Pipeline] Saved WorkRequest ${workRequest.requestId}`);

  // 5. Project Timeline & Linking
  if (aiAnalysis.projectLinked) {
    const project = await Project.findOne({
      name: { $regex: aiAnalysis.projectLinked, $options: "i" }
    });
    if (project) {
      if (!project.workRequests.includes(workRequest._id)) {
        project.workRequests.push(workRequest._id);

        project.activityLog.push({
          action: "Work Request Linked",
          icon: "🔗",
          remarks: `Linked auto-generated Work Request: ${workRequest.requestId}`
        });

        // Add engineer to project engineers if not present
        if (engineerUser && !project.engineers.includes(engineerUser._id)) {
          project.engineers.push(engineerUser._id);
        }

        await project.save();
        console.log(`[Downstream Pipeline] Linked WorkRequest ${workRequest.requestId} to Project: ${project.name}`);
      }
    }
  }

  // 6. Emit Socket update for frontend updates
  if (io) {
    console.log("🔥 Emitting Socket Event: workRequestUpdated");
    io.emit("workRequestUpdated", workRequest);
  }
};

module.exports = {
  verifyMetaWebhook,
  findOrCreateConversation,
  processMetaIncomingWebhook
};
