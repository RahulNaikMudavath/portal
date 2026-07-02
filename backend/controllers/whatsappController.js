const WhatsAppMessage = require("../models/WhatsAppMessage");


exports.receiveMessage = async (req, res) => {
  try {
    console.log(req.body);
    const message = await WhatsAppMessage.create({

      conversationId: req.body.conversationId,

      phoneNumber: req.body.phoneNumber,

      customerName: req.body.customerName,

      text: req.body.text,

      direction: req.body.direction,

      messageType: req.body.messageType,

      mediaUrl: req.body.mediaUrl,

      fileName: req.body.fileName

    });

    res.status(201).json(message);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  }
};

exports.getConversations = async (req, res) => {
  try {

    const messages = await WhatsAppMessage.find()
      .sort({ createdAt: 1 });

    const conversationMap = {};

    messages.forEach((msg) => {

      const id = msg.conversationId;

      if (!conversationMap[id]) {

        conversationMap[id] = {

          conversationId: id,

          customerName: msg.customerName,

          phoneNumber: msg.phoneNumber,

          lastMessage: "",

          lastTime: "",

          unread: 0,

          messages: []

        };

      }

      conversationMap[id].messages.push({

        _id: msg._id,

        text: msg.message || msg.text,

        direction: msg.direction,

        messageType: msg.messageType,

        mediaUrl: msg.mediaUrl,

        createdAt: msg.createdAt

      });

      conversationMap[id].lastMessage = msg.message || msg.text;

      conversationMap[id].lastTime = msg.createdAt;

      if (msg.direction === "incoming") {

        conversationMap[id].unread++;

      }

    });

    res.json(Object.values(conversationMap));

  } catch (err) {

    console.error(err);

    res.status(500).json({

      message: err.message,

    });

  }
};