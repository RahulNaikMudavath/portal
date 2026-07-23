const projectService = require("../services/projectService");

// Create Project (Admin only)
exports.createProject = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const project = await projectService.createProject(req.body, req.user);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Projects (Admin gets all, client gets assigned)
exports.getProjects = async (req, res) => {
  try {
    const projects = await projectService.getProjectsForUser(req.user);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Project Details
exports.getProjectById = async (req, res) => {
  try {
    const project = await projectService.getProjectDetails(req.params.id, req.user);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    if (error.message.includes("Not authorized")) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update Project (Admin only)
exports.updateProject = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const project = await projectService.updateProjectDetails(req.params.id, req.body, req.user.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Link Task to Project
exports.addTaskToProject = async (req, res) => {
  try {
    const project = await projectService.linkTask(req.params.id, req.body.taskId, req.user.id);
    if (!project) {
      return res.status(404).json({ message: "Project or Task not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Document Upload to Project
exports.addProjectDocument = async (req, res) => {
  try {
    const project = await projectService.addDocuments(req.params.id, req.files, req.user.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Photo to Project Gallery
exports.addProjectPhoto = async (req, res) => {
  try {
    const project = await projectService.addPhotos(req.params.id, req.files, req.body.stage, req.user.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Project (Admin only)
exports.deleteProject = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const success = await projectService.deleteProjectById(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
