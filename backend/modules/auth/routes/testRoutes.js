const express = require("express");
const router = express.Router();

const { protect } = require("../../../middleware/authMiddleware");
const { isAdmin, isClient } = require("../../../middleware/roleMiddleware");

// 🔒 Protected route (any logged-in user)
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});


// 👑 Admin only
router.get("/admin", protect, isAdmin, (req, res) => {
  res.json({ message: "Welcome Admin" });
});


// 👨‍💻 Client only
router.get("/client", protect, isClient, (req, res) => {
  res.json({ message: "Welcome Client" });
});

module.exports = router;