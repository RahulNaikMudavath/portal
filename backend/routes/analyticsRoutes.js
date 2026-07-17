const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

const {
  getAdminAnalytics,
  getEngineerPerformanceAnalytics,
  getAiAnalytics
} = require("../controllers/analyticsController");

router.get("/admin", protect, isAdmin, getAdminAnalytics);
router.get("/engineers", protect, isAdmin, getEngineerPerformanceAnalytics);
router.get("/ai", protect, isAdmin, getAiAnalytics);

module.exports = router;