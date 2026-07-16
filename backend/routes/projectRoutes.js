const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  addTaskToProject,
  addProjectDocument,
  addProjectPhoto,
  deleteProject
} = require("../controllers/projectController");

// 🏗️ Projects router routes
router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, updateProject);
router.put("/:id/tasks", protect, addTaskToProject);

router.put("/:id/documents", protect, upload.array("files"), addProjectDocument);
router.put("/:id/photos", protect, upload.array("files"), addProjectPhoto);

router.delete("/:id", protect, deleteProject);

module.exports = router;
