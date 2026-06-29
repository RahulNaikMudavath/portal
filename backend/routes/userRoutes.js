const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

const {
  getAllUsers,
  getClients,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getProfile,
  updateProfile
} = require("../controllers/userController");

// 👤 Profile Routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// 👑 Admin → get all users
router.get("/", protect, isAdmin, getAllUsers);

// 👑 Admin → get only clients
router.get("/clients", protect, isAdmin, getClients);

// 📢 Get user notifications
router.get("/notifications/list", protect, getNotifications);

// ✅ Mark single notification as read
router.put(
  "/notifications/:notificationId/read",
  protect,
  markNotificationAsRead
);

// ✅ Mark all notifications as read
router.put(
  "/notifications/read-all",
  protect,
  markAllNotificationsAsRead
);

module.exports = router;