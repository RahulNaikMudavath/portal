const WhatsappMessage = require("../models/Message");
const WhatsAppConversation = require("../models/Conversation");
const { analyzeConversation } = require("../../../modules/ai/services/aiService");
const { verifyMetaWebhook, processMetaIncomingWebhook } = require("../webhooks/webhookHandler");
const { sendTextMessage, sendMediaMessage } = require("../services/messageService");
const {
  validateWebhookVerifyQuery,
  validateSendMessagePayload
} = require("../validators/whatsappValidator");
const { emitWhatsAppEvents } = require("../socket/socketEvents");

/**
 * 💬 Fetch Conversations (GET /api/whatsapp/conversations)
 */
const getConversations = async (req, res) => {
  try {
    const dbConversations = await WhatsAppConversation.find()
      .populate("user", "name email phone avatar role")
      .populate("assignedAgent", "name email phone avatar role")
      .sort({ lastMessageAt: -1 });

    if (dbConversations.length > 0) {
      const result = await Promise.all(
        dbConversations.map(async (conv) => {
          const messages = await WhatsappMessage.find({
            $or: [
              { conversation: conv._id },
              { conversationId: conv.conversationId }
            ]
          }).sort({ createdAt: 1 });

          const chatObj = conv.toObject();
          chatObj.messages = messages;

          // Auto-resolve real sender name from incoming messages or linked user
          const realNameMsg = messages.find(
            (m) =>
              m.direction === "incoming" &&
              m.customerName &&
              m.customerName !== "Customer" &&
              m.customerName !== "Unknown Customer"
          );

          if (realNameMsg?.customerName) {
            if (
              !chatObj.customerName ||
              chatObj.customerName === "Customer" ||
              chatObj.customerName === "Unknown Customer"
            ) {
              chatObj.customerName = realNameMsg.customerName;
              WhatsAppConversation.updateOne(
                { _id: conv._id },
                { $set: { customerName: realNameMsg.customerName } }
              ).catch(() => {});
            }
          } else if (conv.user?.name) {
            chatObj.customerName = conv.user.name;
          }

          try {
            chatObj.ai = await analyzeConversation(messages);
          } catch (aiErr) {
            chatObj.ai = null;
          }

          return chatObj;
        })
      );

      return res.json(result);
    }

    // Fallback: Group by conversationId from messages if no WhatsAppConversation records exist
    const messages = await WhatsappMessage.find().sort({ createdAt: 1 });
    const grouped = {};

    messages.forEach((msg) => {
      if (!grouped[msg.conversationId]) {
        grouped[msg.conversationId] = {
          _id: msg.conversationId,
          conversationId: msg.conversationId,
          customerName:
            msg.customerName &&
            msg.customerName !== "Customer" &&
            msg.customerName !== "Unknown Customer"
              ? msg.customerName
              : "Customer",
          phoneNumber: msg.phoneNumber,
          lastMessage: "",
          lastTime: "",
          unread: 0,
          messages: []
        };
      }

      if (
        msg.direction === "incoming" &&
        msg.customerName &&
        msg.customerName !== "Customer" &&
        msg.customerName !== "Unknown Customer"
      ) {
        grouped[msg.conversationId].customerName = msg.customerName;
      }

      grouped[msg.conversationId].messages.push(msg);
      grouped[msg.conversationId].lastMessage = msg.text;
      grouped[msg.conversationId].lastTime = msg.createdAt;

      if (msg.direction === "incoming") {
        grouped[msg.conversationId].unread++;
      }
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ message: err.message });
  }
};

const crypto = require("crypto");

/**
 * Verify Meta HMAC SHA256 Signature from X-Hub-Signature-256 header
 */
const verifyMetaSignature = (req) => {
  const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET;
  if (!appSecret) {
    // If not configured, allow processing (backward compatible for local dev/testing)
    return true;
  }

  const signature = req.headers["x-hub-signature-256"];
  if (!signature) {
    console.warn("[MetaWebhook] Missing X-Hub-Signature-256 header");
    return false;
  }

  const parts = signature.split("=");
  if (parts.length !== 2 || parts[0] !== "sha256") {
    console.warn("[MetaWebhook] Invalid X-Hub-Signature-256 format");
    return false;
  }

  const signatureHash = parts[1];
  const payload = req.rawBody || JSON.stringify(req.body);

  try {
    const expectedHash = crypto
      .createHmac("sha256", appSecret)
      .update(payload, "utf8")
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signatureHash, "utf8"),
      Buffer.from(expectedHash, "utf8")
    );
  } catch (err) {
    console.error("[MetaWebhook] Error verifying signature:", err);
    return false;
  }
};

/**
 * 🌐 Meta WhatsApp Cloud API Verification (GET /api/whatsapp/webhook)
 */
const metaVerifyWebhook = (req, res) => {
  console.log("🔍 [MetaWebhook GET] Verification request:", req.query);
  const validation = validateWebhookVerifyQuery(req.query);

  if (!validation.isValid) {
    return res.status(400).json({ message: validation.error });
  }

  if (verifyMetaWebhook(validation.mode, validation.token)) {
    console.log("[MetaWhatsApp] Webhook verified successfully!");
    return res.status(200).send(validation.challenge);
  } else {
    console.warn("[MetaWhatsApp] Webhook verification token mismatch");
    return res.sendStatus(403);
  }
};

const metaReceiveWebhook = async (req, res) => {
    try {
      // Validate Meta signature if APP_SECRET is configured
      if (!verifyMetaSignature(req)) {
        console.warn("[MetaWebhook] Unauthorized webhook signature. Dropping request.");
        return res.status(403).json({ error: "Invalid webhook signature" });
      }

      const io = req.app.get("io");
      const body = req.body;

      if (body.object === "whatsapp_business_account") {
        // Immediate 200 OK ACK to Meta
        res.status(200).send("EVENT_RECEIVED");

        // Asynchronously process message persistence, deduplication & socket events
        await processMetaIncomingWebhook(body, io);
      } else {
        return res.sendStatus(404);
      }
    } catch (err) {
      console.error("Meta Webhook processing error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    }
};

/**
 * 📤 Send Outgoing WhatsApp Message via Meta WhatsApp Cloud API (POST /api/whatsapp/send)
 */
const sendMessage = async (req, res) => {
  try {
    const validation = validateSendMessagePayload(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    const io = req.app.get("io");
    const senderUserId = req.user ? req.user._id : null;

    const result = await sendTextMessage(validation.recipient, validation.text, io, senderUserId);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error sending WhatsApp message:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * 📎 Send Outgoing Media Message (Image, Video, Audio, Document) (POST /api/whatsapp/send-media)
 */
const sendMedia = async (req, res) => {
  try {
    const recipient = req.body.to || req.body.phoneNumber;
    if (!recipient) {
      return res.status(400).json({ message: "Recipient phone number ('to' or 'phoneNumber') is required" });
    }

    let mediaUrl = req.body.mediaUrl || "";
    let mimeType = req.body.mimeType || "";
    let fileName = req.body.fileName || "";
    let fileSize = req.body.fileSize || 0;

    // If file was uploaded via multer/cloudinary
    if (req.file) {
      mediaUrl = req.file.path || req.file.secure_url || req.file.url;
      mimeType = req.file.mimetype || "";
      fileName = req.file.originalname || "";
      fileSize = req.file.size || 0;
    }

    if (!mediaUrl) {
      return res.status(400).json({ message: "No media file or mediaUrl provided" });
    }

    // Determine media type
    let mediaType = "image";
    if (mimeType.startsWith("video/")) mediaType = "video";
    else if (mimeType.startsWith("audio/")) mediaType = "audio";
    else if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("sheet") || mimeType.includes("text") || mimeType.includes("zip") || mimeType.includes("octet-stream")) {
      mediaType = "document";
    } else if (req.body.mediaType) {
      mediaType = req.body.mediaType;
    }

    const caption = (req.body.caption || req.body.text || "").trim();
    const io = req.app.get("io");
    const senderUserId = req.user ? req.user._id : null;

    const result = await sendMediaMessage(
      recipient,
      mediaUrl,
      mediaType,
      caption,
      fileName,
      { mimeType, fileSize, fileName },
      io,
      senderUserId
    );

    res.status(201).json(result);
  } catch (err) {
    console.error("Error sending WhatsApp media message:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * 🤖 Simulate Incoming Customer WhatsApp Message (POST /api/whatsapp/simulate-incoming)
 * Used in sandbox/demo to test real-time alerts, audio chimes, and AI task extraction.
 */
const simulateIncoming = async (req, res) => {
  try {
    const {
      from = "919876543210",
      customerName = "Er. Senthil Kumar (Client)",
      text = "Hi MAARAN Engineers, can you please share the structural estimate for the ongoing pillar work?",
      messageType = "text",
      mediaUrl = "",
      fileName = ""
    } = req.body;

    const { findOrCreateConversation } = require("../services/conversationService");
    const { emitWhatsAppEvents } = require("../socket/socketEvents");
    const conversation = await findOrCreateConversation(from, customerName);

    let mediaObj = null;
    if (mediaUrl) {
      mediaObj = {
        url: mediaUrl,
        mimeType: messageType === "image" ? "image/jpeg" : messageType === "audio" ? "audio/mp3" : "application/pdf",
        fileName: fileName || (messageType === "image" ? "site-inspection.jpg" : "document.pdf")
      };
    }

    const createdMessage = await WhatsappMessage.create({
      conversationId: conversation.conversationId,
      conversation: conversation._id,
      metaMessageId: `SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      phoneNumber: from,
      customerName: customerName,
      direction: "incoming",
      messageType: messageType,
      text: text,
      media: mediaObj,
      mediaUrl: mediaUrl,
      fileName: fileName,
      status: "received",
      createdAt: new Date()
    });

    conversation.lastMessageAt = new Date();
    conversation.lastMessage = text || `[${messageType.toUpperCase()}]`;
    conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    await conversation.save();

    const io = req.app.get("io");
    if (io) {
      emitWhatsAppEvents(io, "newMessage", createdMessage);
      emitWhatsAppEvents(io, "conversationUpdated", conversation);
    }

    res.status(201).json({
      message: "Simulated message received successfully",
      data: createdMessage
    });
  } catch (err) {
    console.error("Simulation error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getConversations,
  metaVerifyWebhook,
  metaReceiveWebhook,
  sendMessage,
  sendMedia,
  simulateIncoming
};

