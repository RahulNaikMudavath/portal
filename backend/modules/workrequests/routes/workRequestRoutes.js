const express = require("express");
const router = express.Router();

const { protect } = require("../../../middleware/authMiddleware");
const {
  createWorkRequest,
  getAllWorkRequests,
  getWorkRequest,
  convertToWorkOrder,
} = require("../controllers/workRequestController");

router.post("/", protect, createWorkRequest);
router.get("/", protect, getAllWorkRequests);
router.get("/:id", protect, getWorkRequest);
router.post("/:id/convert", protect, convertToWorkOrder);

module.exports = router;