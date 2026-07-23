const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    // Identification & Contact Info
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    phoneNumber: {
      type: String,
      required: true,
      index: true
    },

    customerName: {
      type: String,
      default: "Unknown Customer"
    },

    // User Model Integration (Reused User model)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },

    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },

    // Conversation Status & Metrics
    status: {
      type: String,
      enum: ["open", "in_progress", "closed", "archived", "pending_ai_review"],
      default: "open",
      index: true
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },

    unreadCount: {
      type: Number,
      default: 0
    },

    lastMessage: {
      type: String,
      default: ""
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WhatsappMessage",
      default: null
    },

    // Prepared Schema Fields for Future AI Integration
    aiSummary: {
      type: String,
      default: ""
    },

    aiSentiment: {
      type: String,
      enum: ["positive", "neutral", "negative", "urgent", "unknown"],
      default: "unknown"
    },

    aiIntent: {
      type: String,
      default: ""
    },

    aiExtractedEntities: {
      location: { type: String, default: "" },
      budget: { type: String, default: "" },
      projectType: { type: String, default: "" },
      contactInfo: { type: String, default: "" },
      rawJson: { type: mongoose.Schema.Types.Mixed, default: {} }
    },

    aiTags: {
      type: [String],
      default: []
    },

    aiSuggestedResponse: {
      type: String,
      default: ""
    },

    aiEmbedding: {
      type: [Number],
      default: []
    },

    aiLastAnalyzedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Prevent overwrite errors if model is already compiled by mongoose
module.exports = mongoose.models.WhatsAppConversation || mongoose.model("WhatsAppConversation", conversationSchema);
