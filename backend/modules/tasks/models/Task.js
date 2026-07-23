const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },
    taskCategory: {
    type: String,
    enum: ["office", "field"],
    default: "office",
},

    workMode: {
        type: String,
        enum: ["office", "field"],
        default: "office"
    },

    customerName: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    projectType: {
      type: String,
      default: "",
    },
    estimatedBudget: {
      type: String,
      default: "",
    },
    siteAddress: {
      type: String,
      default: "",
    },
    locationCoords: {
      type: String,
      default: "",
    },
    siteManager: {
      type: String,
      default: "",
    },
    accessHours: {
      type: String,
      default: "",
    },

    materials: [
      {
        name: { type: String, required: true },
        qty: { type: String, required: true },
        unit: { type: String, default: "units" },
        remarks: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    notes: [
      {
        text: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        userName: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    customerSignName: {
      type: String,
      default: "",
    },
    customerSignPhone: {
      type: String,
      default: "",
    },
    customerSignRemarks: {
      type: String,
      default: "",
    },
    customerSignRating: {
      type: Number,
      default: 0,
    },
    customerSignature: {
      type: String,
      default: "",
    },

    visitStatus: {
        type: String,
        enum: [
            "not-required",
            "travelling",
            "reached-site",
            "inspection",
            "working",
            "completed"
        ],
        default: "not-required"
    },

    status: {
        type: String,
        enum: [
            "assigned",
            "accepted",
            "working",
            "submitted",
            "approved",
            "completed"
        ],
        default: "assigned"
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    totalTimeSpent: {
      type: Number,
      default: 0,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    deadline: {
      type: Date,
      default: null,
    },

    files: [String],

    submissionFiles: [String],

    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    adminRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    adminReviewFeedback: {
      type: String,
      default: "",
    },

    activityLog: [
      {
        action: {
          type: String,
          required: true,
        },
        icon: {
          type: String,
          default: "📋",
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        remarks: {
          type: String,
          default: "",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    progressUpdates: [
      {
        percentage: Number,

        message: {
          type: String,
          trim: true,
          default: "",
        },

        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);