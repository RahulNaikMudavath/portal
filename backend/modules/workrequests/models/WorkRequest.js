const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: "",
    },

    fileName: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      default: "",
    },

    size: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      default: "Customer",
    },

    message: {
      type: String,
      default: "",
    },

    messageType: {
      type: String,
      enum: [
        "text",
        "pdf",
        "image",
        "video",
        "voice",
        "location",
      ],
      default: "text",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const workRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      default: "",
    },

    phoneNumber: {
      type: String,
      default: "",
    },

    whatsappNumber: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    source: {
      type: String,
      enum: ["whatsapp", "manual", "email"],
      default: "manual",
    },

    projectName: {
      type: String,
      default: "",
    },

    projectType: {
      type: String,
      enum: [
        "Residential",
        "Commercial",
        "Industrial",
        "Renovation",
        "Interior",
        "Other",
      ],
      default: "Residential",
    },

    siteAddress: {
      type: String,
      default: "",
    },

    googleMapsLink: {
      type: String,
      default: "",
    },

    subject: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    estimatedBudget: {
      type: Number,
      default: 0,
    },

    preferredVisitDate: {
      type: Date,
      default: null,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    status: {
      type: String,
      enum: [
        "new",
        "under-review",
        "assigned",
        "completed",
        "archived",
      ],
      default: "new",
    },

    attachments: [attachmentSchema],

    conversation: [conversationSchema],

    aiSummary: {
      type: String,
      default: "",
    },

    convertedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    assignedEngineer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Generate Request ID automatically
workRequestSchema.pre("save", async function () {
  if (!this.requestId) {
    const count = await mongoose.model("WorkRequest").countDocuments();

    this.requestId = `WR-${new Date().getFullYear()}-${String(
      count + 1
    ).padStart(6, "0")}`;
  }
});

module.exports = mongoose.model(
  "WorkRequest",
  workRequestSchema
);