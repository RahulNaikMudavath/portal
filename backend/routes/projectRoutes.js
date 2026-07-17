const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
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
router.post("/", protect, isAdmin, createProject);
router.get("/", protect, getProjects);
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, isAdmin, updateProject);
router.put("/:id/tasks", protect, isAdmin, addTaskToProject);

router.put("/:id/documents", protect, upload.array("files"), addProjectDocument);
router.put("/:id/photos", protect, upload.array("files"), addProjectPhoto);

router.delete("/:id", protect, isAdmin, deleteProject);

module.exports = router;
