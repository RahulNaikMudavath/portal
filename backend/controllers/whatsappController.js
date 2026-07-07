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