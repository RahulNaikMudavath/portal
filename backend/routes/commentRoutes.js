const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  getTaskComments,
  addTaskComment,
} = require("../controllers/commentController");

router.get("/task/:taskId", protect, getTaskComments);
router.post("/task/:taskId", protect, addTaskComment);

module.exports = router;