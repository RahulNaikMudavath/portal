const mongoose = require("mongoose");

const calendarEventSchema = new mongoose.Schema(
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
    eventType: {
      type: String,
      enum: [
        "engineer-visit",
        "site-visit",
        "deadline",
        "inspection",
        "meeting",
        "customer-visit",
        "support",
      ],
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    engineers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: String,
      default: "",
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    // Google Calendar Sync placeholders
    gcalEventId: {
      type: String,
      default: null,
    },
    gcalSyncStatus: {
      type: String,
      enum: ["synced", "pending", "error"],
      default: "pending",
    },
    gcalLastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for faster overlap checks
calendarEventSchema.index({ start: 1, end: 1 });
calendarEventSchema.index({ engineers: 1 });

module.exports = mongoose.model("CalendarEvent", calendarEventSchema);
