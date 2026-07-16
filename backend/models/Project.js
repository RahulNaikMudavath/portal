const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    budget: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["planning", "active", "completed", "on-hold"],
      default: "active",
    },
    aiSummary: {
      type: String,
      default: "No summary generated yet.",
    },
    engineers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    workRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkRequest",
      },
    ],
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    photos: [
      {
        name: String,
        url: String,
        stage: { type: String, enum: ["before", "during", "after"], default: "before" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    activityLog: [
      {
        action: { type: String, required: true },
        icon: { type: String, default: "📌" },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        remarks: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
