const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

const {
  getAdminAnalytics,
} = require("../controllers/analyticsController");

router.get("/admin", protect, isAdmin, getAdminAnalytics);

module.exports = router;