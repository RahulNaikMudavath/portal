const WhatsappMessage = require("../models/Message");
const WhatsAppConversation = require("../models/Conversation");
const { analyzeConversation } = require("../../../modules/ai/services/aiService");
const { verifyMetaWebhook, processMetaIncomingWebhook } = require("../webhooks/webhookHandler");
const { sendTextMessage } = require("../services/messageService");
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
          customerName: msg.customerName,
          phoneNumber: msg.phoneNumber,
          lastMessage: "",
          lastTime: "",
          unread: 0,
          messages: []
        };
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

const fs = require("fs");
const path = require("path");

const metaReceiveWebhook = async (req, res) => {
    console.log("🔥 RAW WEBHOOK:");
    console.dir(req.body, { depth: null });
    console.log("=================================");
    console.log("META WEBHOOK RECEIVED");
    console.log("HEADERS:", req.headers);
    console.log("BODY:", JSON.stringify(req.body, null, 2));
    console.log("=================================");

    try {
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

module.exports = {
  getConversations,
  metaVerifyWebhook,
  metaReceiveWebhook,
  sendMessage
};
