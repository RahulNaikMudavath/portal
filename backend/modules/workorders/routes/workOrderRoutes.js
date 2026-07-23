const express = require("express");

const router = express.Router();

const {
  createWorkOrder,
} = require("../controllers/workOrderController");

const { protect } = require("../../../middleware/authMiddleware");

// Temporary debug
console.log("createWorkOrder:", createWorkOrder);
console.log("protect:", protect);

router.post("/", protect, createWorkOrder);
module.exports = router;