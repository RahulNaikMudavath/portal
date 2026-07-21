const mongoose = require("mongoose");

const dashboardSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  widgets: {
    type: [String],
    default: ["overview_stats", "active_workload", "ai_predictions", "recent_activity"]
  },
  preferences: {
    type: Map,
    of: String,
    default: { layout: "grid", dense: "false" }
  },
  settings: {
    type: Map,
    of: String,
    default: { emailAlerts: "true", darkModeDefault: "true" }
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model("DashboardSettings", dashboardSettingsSchema);
