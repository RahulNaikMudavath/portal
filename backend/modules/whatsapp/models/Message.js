const mongoose = require("mongoose");

const whatsappMessageSchema = new mongoose.Schema(
  {
    // Conversation References & Meta API Identifiers
    conversationId: {
      type: String,
      required: true,
      index: true
    },

    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WhatsAppConversation",
      default: null,
      index: true
    },

    metaMessageId: {
      type: String,
      default: "",
      index: true
    },

    // User Model Integration
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },

    phoneNumber: {
      type: String,
      required: true
    },

    customerName: {
      type: String,
      default: "Unknown Customer"
    },

    direction: {
      type: String,
      enum: ["incoming", "outgoing"],
      required: true
    },

    // Supported Message & Media Types
    messageType: {
      type: String,
      enum: ["text", "image", "pdf", "video", "audio", "document", "location", "template"],
      default: "text",
      index: true
    },

    text: {
      type: String,
      default: ""
    },

    // Multi-Media Attachment Metadata
    media: {
      url: { type: String, default: "" },
      metaMediaId: { type: String, default: "" },
      mimeType: { type: String, default: "" },
      fileName: { type: String, default: "" },
      fileSize: { type: Number, default: 0 },
      thumbnailUrl: { type: String, default: "" },
      durationSeconds: { type: Number, default: 0 }
    },

    // Top-Level Legacy Fields for Backwards Compatibility
    mediaUrl: {
      type: String,
      default: ""
    },

    fileName: {
      type: String,
      default: ""
    },

    // Delivery & Read Status
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed", "received"],
      default: "received",
      index: true
    },

    errorDetails: {
      code: { type: String, default: "" },
      message: { type: String, default: "" }
    },

    // Prepared Schema Fields for Future AI Integration
    aiClassification: {
      type: String,
      default: ""
    },

    aiSentimentScore: {
      type: Number,
      default: 0
    },

    aiExtractedText: {
      type: String,
      default: ""
    },

    aiAudioTranscript: {
      type: String,
      default: ""
    },

    aiEmbedding: {
      type: [Number],
      default: []
    },

    aiProcessed: {
      type: Boolean,
      default: false
    },

    aiTokens: {
      inputTokens: { type: Number, default: 0 },
      outputTokens: { type: Number, default: 0 }
    },

    aiModel: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Prevent overwrite errors if model is already compiled by mongoose
module.exports = mongoose.models.WhatsappMessage || mongoose.model("WhatsappMessage", whatsappMessageSchema);
