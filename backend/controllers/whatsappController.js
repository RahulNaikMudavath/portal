const WhatsappMessage = require("../models/WhatsAppMessage");
const WorkRequest = require("../models/WorkRequest");
const {
    analyzeConversation
} = require("../services/aiService");

exports.receiveMessage = async (req, res) => {
  try {
    console.log(req.body);

    const io = req.app.get("io");

    const message = await WhatsappMessage.create({
      conversationId: req.body.conversationId,
      phoneNumber: req.body.phoneNumber,
      customerName: req.body.customerName,
      direction: req.body.direction,
      messageType: req.body.messageType || "text",
      text: req.body.text,
      mediaUrl: req.body.mediaUrl || "",
      fileName: req.body.fileName || "",
    });

    // 🔥 Send message instantly to all connected clients
    console.log("🔥 Emitting Socket Event");
    io.emit("newMessage", message);

    res.status(201).json(message);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getConversations = async (req, res) => {
  try {

    const messages = await WhatsappMessage.find().sort({
      createdAt: 1,
    });

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
          messages: [],
        };

      }

      grouped[msg.conversationId].messages.push(msg);

      grouped[msg.conversationId].lastMessage = msg.text;

      grouped[msg.conversationId].lastTime = msg.createdAt;

      if (msg.direction === "incoming") {
        grouped[msg.conversationId].unread++;
      }

    });

    // Fetch all Work Requests to filter out assigned ones (sorting by createdAt descending)
    const allRequests = await WorkRequest.find().sort({ createdAt: -1 });

    const filteredChats = [];

    for (const chat of Object.values(grouped)) {
      // Find matching work requests (comparing phone numbers digits-only)
      const chatPhone = chat.phoneNumber ? chat.phoneNumber.replace(/\D/g, "") : "";
      
      const matchedRequests = allRequests.filter(reqItem => {
        const reqPhone = reqItem.phoneNumber ? reqItem.phoneNumber.replace(/\D/g, "") : "";
        return reqPhone && chatPhone && (reqPhone.includes(chatPhone) || chatPhone.includes(reqPhone));
      });

      // Look at the most recent work request for this phone number
      const mostRecentRequest = matchedRequests[0];

      // Hide conversation if the most recent request has already been assigned
      if (mostRecentRequest && mostRecentRequest.status === "assigned") {
        continue;
      }

      chat.ai = await analyzeConversation(chat.messages);

      // Link to the most recent pending ("new") request if it exists
      if (mostRecentRequest && mostRecentRequest.status === "new") {
        chat.workRequestId = mostRecentRequest._id;
      } else {
        chat.workRequestId = null;
      }

      filteredChats.push(chat);
    }

    res.json(filteredChats);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message,
    });

  }
};

// 🌐 Meta WhatsApp Cloud API Verification (GET /api/whatsapp/webhook)
exports.metaVerifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "admin_portal_whatsapp_token";

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("[MetaWhatsApp] Webhook verified successfully!");
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
};

// 📩 Meta WhatsApp Cloud API Incoming Message Webhook (POST /api/whatsapp/webhook)
exports.metaReceiveWebhook = async (req, res) => {
  try {
    const io = req.app.get("io");
    const body = req.body;

    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (value && value.messages && value.messages[0]) {
            const msg = value.messages[0];
            const from = msg.from;
            const name = value.contacts && value.contacts[0] ? value.contacts[0].profile.name : `Customer (${from.slice(-4)})`;
            const text = msg.text ? msg.text.body : "[Media / Attachment]";

            const createdMessage = await WhatsappMessage.create({
              conversationId: `conv_${from}`,
              phoneNumber: from,
              customerName: name,
              direction: "incoming",
              messageType: msg.type || "text",
              text: text
            });

            if (io) {
              console.log("🔥 Emitting Socket Event for Real Meta WhatsApp Message");
              io.emit("newMessage", createdMessage);
            }
          }
        }
      }
      return res.status(200).send("EVENT_RECEIVED");
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    console.error("Meta Webhook error:", err);
    res.status(500).json({ error: err.message });
  }
};