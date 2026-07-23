const Project = require("../models/Project");
const Task = require("../../../modules/tasks/models/Task");
const User = require("../../../modules/users/models/User");

const createProject = async (data, user) => {
  const { name, customerName, location, budget, engineers } = data;
  return await Project.create({
    name,
    customerName,
    location,
    budget,
    engineers: engineers || [],
    createdBy: user.id,
    activityLog: [
      {
        action: "Project Created",
        icon: "🏗️",
        user: user.id,
        remarks: `Initial configuration of ${name}`
      }
    ]
  });
};

const getProjectsForUser = async (user) => {
  if (user.role === "admin") {
    const org = user.organization || user.company || "";
    let query = { createdBy: user.id };
    
    if (org) {
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
    
    return await Project.find(query)
      .populate("engineers", "name email")
      .sort({ createdAt: -1 });
  } else {
    return await Project.find({ engineers: user.id })
      .populate("engineers", "name email")
      .sort({ createdAt: -1 });
  }
};

const getProjectDetails = async (projectId, user) => {
  const project = await Project.findById(projectId)
    .populate("engineers", "name email phone role")
    .populate({
      path: "tasks",
      populate: { path: "assignedTo", select: "name email" }
    })
    .populate("workRequests");

  if (!project) return null;

  // Authorization check
  if (user.role === "admin") {
    const org = user.organization || user.company || "";
    if (org) {
      const adminsInOrg = await User.find({
        $or: [
          { organization: org },
          { company: org }
        ]
      }).distinct("_id");
      if (project.createdBy && !adminsInOrg.map(id => id.toString()).includes(project.createdBy.toString())) {
        throw new Error("Not authorized to view this project");
      }
    }
  } else {
    if (!project.engineers.some(e => e._id.toString() === user.id)) {
      throw new Error("Not authorized to view this project");
    }
  }

  return project;
};

const updateProjectDetails = async (projectId, data, userId) => {
  const { name, customerName, location, budget, status, engineers } = data;
  const project = await Project.findById(projectId);

  if (!project) return null;

  project.name = name || project.name;
  project.customerName = customerName || project.customerName;
  project.location = location || project.location;
  project.budget = budget !== undefined ? budget : project.budget;
  project.status = status || project.status;
  project.engineers = engineers || project.engineers;

  project.activityLog.push({
    action: "Project Configurations Updated",
    icon: "⚙️",
    user: userId,
    remarks: "Project settings modified by admin"
  });

  await project.save();
  return project;
};

const linkTask = async (projectId, taskId, userId) => {
  const project = await Project.findById(projectId);
  const task = await Task.findById(taskId);

  if (!project || !task) return null;

  if (!project.tasks.includes(taskId)) {
    project.tasks.push(taskId);
    project.activityLog.push({
      action: "Task Linked to Project",
      icon: "📋",
      user: userId,
      remarks: `Linked task: ${task.title}`
    });
    await project.save();
  }

  return project;
};

const addDocuments = async (projectId, files, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;

  const docs = files?.map(file => ({
    name: file.originalname || file.path.split(/[\\/]/).pop(),
    url: file.path
  })) || [];

  project.documents.push(...docs);

  project.activityLog.push({
    action: "Documents Uploaded",
    icon: "📎",
    user: userId,
    remarks: `Uploaded ${docs.length} document(s)`
  });

  await project.save();
  return project;
};

const addPhotos = async (projectId, files, stage, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;

  const photos = files?.map(file => ({
    name: file.originalname || file.path.split(/[\\/]/).pop(),
    url: file.path,
    stage: stage || "before"
  })) || [];

  project.photos.push(...photos);

  project.activityLog.push({
    action: "Photos Added to Gallery",
    icon: "📷",
    user: userId,
    remarks: `Added ${photos.length} image(s) to ${stage || "before"} gallery`
  });

  await project.save();
  return project;
};

const deleteProjectById = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;

  await project.deleteOne();
  return true;
};

module.exports = {
  createProject,
  getProjectsForUser,
  getProjectDetails,
  updateProjectDetails,
  linkTask,
  addDocuments,
  addPhotos,
  deleteProjectById
};
