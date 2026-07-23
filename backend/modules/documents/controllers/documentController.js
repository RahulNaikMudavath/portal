const Document = require("../../../modules/documents/models/Document");
const Project = require("../../../modules/projects/models/Project");
const Task = require("../../../modules/tasks/models/Task");
const User = require("../../../modules/users/models/User");

// Upload / Create Document
exports.uploadDocument = async (req, res) => {
  try {
    const { name, type, project, customerName, engineer, task, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // tags could be stringified array
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = tags.split(",").map(t => t.trim());
      }
    }

    const fileUrl = req.file.path; // S3 ready: if using multer-s3, req.file.path or req.file.location contains S3 url

    const docName = name || req.file.originalname;

    const document = await Document.create({
      name: docName,
      type: type || "other",
      url: fileUrl,
      project: project || null,
      customerName: customerName || "",
      engineer: engineer || null,
      task: task || null,
      tags: parsedTags,
      uploadedBy: req.user.id,
      versions: [
        {
          versionNumber: 1,
          url: fileUrl,
          uploadedBy: req.user.id
        }
      ],
      activityLog: [
        {
          action: "Document Uploaded (v1)",
          user: req.user.id
        }
      ]
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Documents (filtered)
exports.getDocuments = async (req, res) => {
  try {
    const { project, type, engineer, task, search, pinned } = req.query;
    const query = {};

    if (project) query.project = project;
    if (type) query.type = type;
    if (engineer) query.engineer = engineer;
    if (task) query.task = task;
    if (pinned) query.pinned = pinned === "true";

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Role restriction: client can only see documents where they are the engineer or that are public/associated to their projects
    if (req.user.role !== "admin") {
      // Find client's projects to allow viewing project documents
      const usersProjects = await Project.find({ engineers: req.user.id }).select("_id");
      const projectIds = usersProjects.map(p => p._id);
      
      query.$or = [
        { engineer: req.user.id },
        { project: { $in: projectIds } },
        { uploadedBy: req.user.id }
      ];
    }

    const documents = await Document.find(query)
      .populate("project", "name")
      .populate("engineer", "name email")
      .populate("task", "title")
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle Pin Status
exports.togglePin = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.pinned = !document.pinned;
    document.activityLog.push({
      action: document.pinned ? "Document Pinned" : "Document Unpinned",
      user: req.user.id
    });

    await document.save();
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload New Version of Document
exports.uploadNewVersion = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const fileUrl = req.file.path; // S3 ready
    const newVersionNumber = document.versions.length + 1;

    document.url = fileUrl;
    document.versions.push({
      versionNumber: newVersionNumber,
      url: fileUrl,
      uploadedBy: req.user.id
    });
    document.activityLog.push({
      action: `New Version Uploaded (v${newVersionNumber})`,
      user: req.user.id
    });

    await document.save();
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (req.user.role !== "admin" && document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this document" });
    }

    await document.deleteOne();
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
