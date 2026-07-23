const User = require("../../../modules/users/models/User");
const Notification = require("../../../modules/notifications/models/Notification");

// 👑 Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const org = req.user.organization || req.user.company || "";
    let query = { $or: [{ createdBy: req.user.id }, { _id: req.user.id }] };
    if (org) {
      query = {
        $or: [
          { organization: org },
          { company: org }
        ]
      };
    }
    const users = await User.find(query).select("-password"); // hide password
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// 👨‍💻 Get only clients and engineers
exports.getClients = async (req, res) => {
  try {
    const { search } = req.query;
    const org = req.user.organization || req.user.company || "";
    
    let query = { role: { $in: ["client", "engineer"] } };
    if (org) {
      query.$or = [
        { organization: org },
        { company: org },
        { createdBy: req.user.id },
        { createdBy: { $exists: false } },
        { createdBy: null }
      ];
    }

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      const searchOr = [
        { name: regex },
        { rollNumber: regex },
        { email: regex }
      ];
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchOr }
        ];
        delete query.$or;
      } else {
        query.$or = searchOr;
      }
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
    const User = require("../../../modules/users/models/User");
    const org = req.user.organization || req.user.company || "";
    let query = { role: { $in: ["client", "engineer"] } };
    if (org) {
      query = {
        role: { $in: ["client", "engineer"] },
        $or: [
          { organization: org },
          { company: org },
          { createdBy: req.user.id },
          { createdBy: { $exists: false } },
          { createdBy: null }
        ]
      };
    }

    const engineers = await User.find(
      query,
      "_id name email rollNumber phone city department workMode availability photo"
    );

    res.json(engineers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch engineers",
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { 
      name, phone, city, company, address, 
      skills, department, workMode, experience, availability 
    } = req.body;

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

    if (skills !== undefined) {
      try {
        user.skills = typeof skills === "string" ? JSON.parse(skills) : skills;
      } catch (e) {
        user.skills = String(skills).split(",").map(s => s.trim()).filter(Boolean);
      }
    }
    
    if (department !== undefined) user.department = department;
    if (workMode !== undefined) user.workMode = workMode;
    if (experience !== undefined) user.experience = Number(experience) || 0;
    if (availability !== undefined) user.availability = availability;

    if (req.file) {
      user.photo = req.file.path;
    }

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

// 👑 Admin -> Delete user (revoke access)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ message: "You cannot revoke access for your own account." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: `Access revoked and profile deleted successfully for ${user.name}.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📍 Update live GPS location of logged-in user
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.currentLocation = {
      lat: Number(lat) || null,
      lng: Number(lng) || null,
      address: address || "",
      updatedAt: new Date()
    };

    await user.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("engineer_location_updated", {
        userId: user._id,
        currentLocation: user.currentLocation
      });
    }

    res.status(200).json({
      message: "Location updated successfully",
      currentLocation: user.currentLocation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};