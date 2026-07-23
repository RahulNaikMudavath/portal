const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  user: String,
  action: String,
  taskId: String
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);