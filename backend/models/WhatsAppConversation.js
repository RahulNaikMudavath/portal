const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    unreadCount: {
      type: Number,
      default: 0,
    },

    aiSummary: {
      type: String,
      default: "",
    },

    priority: {
      type: String,
      default: "Medium",
    },

    status: {
      type: String,
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "WhatsAppConversation",
  conversationSchema
);