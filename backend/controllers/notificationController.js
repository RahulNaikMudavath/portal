const Notification = require("../models/Notification");

// Get notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id
    })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

// Mark all as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id },
      { read: true }
    );

    res.json({
      message: "Notifications marked as read"
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};