const express = require("express");
const router = express.Router();

const {
  createWorkOrder,
} = require("../controllers/workOrderController");

const { protect } = require("../../../middleware/authMiddleware");
const { isAdmin } = require("../../../middleware/roleMiddleware");

router.post("/", protect, isAdmin, createWorkOrder);

module.exports = router;