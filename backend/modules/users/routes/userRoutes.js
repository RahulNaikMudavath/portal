const express = require("express");
const router = express.Router();

const { protect } = require("../../../middleware/authMiddleware");
const { isAdmin } = require("../../../middleware/roleMiddleware");
const { getEngineers } = require("../controllers/userController");

const {
  getAllUsers,
  getClients,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getProfile,
  updateProfile,
  deleteUser,
  updateLocation
} = require("../controllers/userController");

const upload = require("../../../middleware/uploadMiddleware");

// 👤 Profile Routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("photo"), updateProfile);
router.put("/location", protect, updateLocation);

// 👑 Admin → get all users
router.get("/", protect, isAdmin, getAllUsers);

// 👑 Admin → delete user (revoke access)
router.delete("/:id", protect, isAdmin, deleteUser);

// 👑 Admin → get only clients
router.get("/clients", protect, isAdmin, getClients);
router.get("/engineers", protect, getEngineers);

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