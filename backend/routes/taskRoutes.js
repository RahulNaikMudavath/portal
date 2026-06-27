const express = require("express");
const router = express.Router();
const Task = require("../models/Task");


// 🔐 Middleware
const protect = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

// 🎯 Controllers
const {
  createTask,
  getTasks,
  completeTask,
  startTask,
  updateTask,
  deleteTask,
  submitTask,
  reviewTask,
  updateTaskProgress,
  getStats,
  getRecentActivities
} = require("../controllers/taskController");


// 👑 Admin creates task (with file upload)
router.post(
  "/",
  protect,
  isAdmin,
  upload.array("files"), // 🔥 handles file uploads
  createTask
);

router.put("/:id/start", protect, startTask);  // FIRST
router.put("/:id", protect, isAdmin, updateTask); // AFTER


// 👨‍💻 Get tasks (both admin & client)
router.get("/", protect, getTasks);

// 📊 Get task statistics (admin only)
router.get("/stats", protect, isAdmin, getStats);


// ✅ Client completes task
router.put("/:id/complete", protect, completeTask);

// � Client updates task progress
router.put("/:taskId/progress", protect, updateTaskProgress);

// �📤 Client submits task
router.put(
  "/:id/submit",
  protect,
  upload.array("files"),
  submitTask
);

// 👑 Admin reviews task submission
router.put("/:id/review", protect, isAdmin, reviewTask);


// ❌ Admin deletes task
router.delete("/:id", protect, isAdmin, deleteTask);

router.get("/activities/recent", protect, isAdmin, getRecentActivities);


// 📁 Get task files
router.get("/:id/files", protect, async (req, res) => {
  const task = await Task.findById(req.params.id);

  res.json({
    files: task.files,
    submissionFiles: task.submissionFiles
  });
});


module.exports = router;