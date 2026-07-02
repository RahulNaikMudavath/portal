const User = require("../models/User");
const Notification = require("../models/Notification");

// 👑 Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // hide password
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// 👨‍💻 Get only clients
exports.getClients = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { role: "client" };

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { name: regex },
        { rollNumber: regex }
      ];
    }

    const clients = await User.find(query).select("-password");
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📢 Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .populate("actionBy", "name email")
      .populate("taskId", "title")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👤 Get Logged In User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    res.status(500).json({
      error: error.message
    });
  }
};
exports.getEngineers = async (req, res) => {
  try {
    const User = require("../models/User");

    const engineers = await User.find(
      { role: "client" }, // Change to "engineer" later if you add that role
      "_id name email"
    );

    res.json(engineers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch engineers",
    });
  }
};

// ✏️ Update Logged In User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, city, company, address } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (company !== undefined) user.company = company;
    if (address !== undefined) user.address = address;

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    res.status(500).json({
      error: error.message
    });
  }
};