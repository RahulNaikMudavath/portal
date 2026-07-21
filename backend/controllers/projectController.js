const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

// Create Project (Admin only)
exports.createProject = async (req, res) => {
  try {
    const { name, customerName, location, budget, engineers } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const project = await Project.create({
      name,
      customerName,
      location,
      budget,
      engineers: engineers || [],
      createdBy: req.user.id,
      activityLog: [
        {
          action: "Project Created",
          icon: "🏗️",
          user: req.user.id,
          remarks: `Initial configuration of ${name}`
        }
      ]
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Projects (Admin gets all, client gets assigned)
exports.getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === "admin") {
      const org = req.user.organization || req.user.company || "";
      let query = { createdBy: req.user.id };
      if (org) {
        const User = require("../models/User");
        const adminsInOrg = await User.find({
          $or: [
            { organization: org },
            { company: org }
          ]
        }).distinct("_id");
        if (adminsInOrg.length > 0) {
          query = { createdBy: { $in: adminsInOrg } };
        }
      }
      projects = await Project.find(query)
        .populate("engineers", "name email")
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({
        engineers: req.user.id
      })
        .populate("engineers", "name email")
        .sort({ createdAt: -1 });
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Project Details
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("engineers", "name email phone role")
      .populate({
        path: "tasks",
        populate: { path: "assignedTo", select: "name email" }
      })
      .populate("workRequests");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Authorization
    if (req.user.role === "admin") {
      const org = req.user.organization || req.user.company || "";
      if (org) {
        const adminsInOrg = await User.find({
          $or: [
            { organization: org },
            { company: org }
          ]
        }).distinct("_id");
        if (project.createdBy && !adminsInOrg.map(id => id.toString()).includes(project.createdBy.toString())) {
          return res.status(403).json({ message: "Not authorized to view this project" });
        }
      }
    } else {
      if (!project.engineers.some(e => e._id.toString() === req.user.id)) {
        return res.status(403).json({ message: "Not authorized to view this project" });
      }
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Project (Admin only)
exports.updateProject = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { name, customerName, location, budget, status, engineers } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.name = name || project.name;
    project.customerName = customerName || project.customerName;
    project.location = location || project.location;
    project.budget = budget !== undefined ? budget : project.budget;
    project.status = status || project.status;
    project.engineers = engineers || project.engineers;

    project.activityLog.push({
      action: "Project Configurations Updated",
      icon: "⚙️",
      user: req.user.id,
      remarks: "Project settings modified by admin"
    });

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Link Task to Project
exports.addTaskToProject = async (req, res) => {
  try {
    const { taskId } = req.body;
    const project = await Project.findById(req.params.id);
    const task = await Task.findById(taskId);

    if (!project || !task) {
      return res.status(404).json({ message: "Project or Task not found" });
    }

    if (!project.tasks.includes(taskId)) {
      project.tasks.push(taskId);
      project.activityLog.push({
        action: "Task Linked to Project",
        icon: "📋",
        user: req.user.id,
        remarks: `Linked task: ${task.title}`
      });
      await project.save();
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Document Upload to Project
exports.addProjectDocument = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const docs = req.files?.map(file => ({
      name: file.originalname || file.path.split(/[\\/]/).pop(),
      url: file.path
    })) || [];

    project.documents.push(...docs);

    project.activityLog.push({
      action: "Documents Uploaded",
      icon: "📎",
      user: req.user.id,
      remarks: `Uploaded ${docs.length} document(s)`
    });

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Photo to Project Gallery
exports.addProjectPhoto = async (req, res) => {
  try {
    const { stage } = req.body; // before / during / after
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const photos = req.files?.map(file => ({
      name: file.originalname || file.path.split(/[\\/]/).pop(),
      url: file.path,
      stage: stage || "before"
    })) || [];

    project.photos.push(...photos);

    project.activityLog.push({
      action: "Photos Added to Gallery",
      icon: "📷",
      user: req.user.id,
      remarks: `Added ${photos.length} image(s) to ${stage || "before"} gallery`
    });

    await project.save();
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

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await project.deleteOne();
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
