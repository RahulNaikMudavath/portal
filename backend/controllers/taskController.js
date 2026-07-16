const Task = require("../models/Task");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");
const WorkRequest = require("../models/WorkRequest");


const updateTaskProgress = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { percentage, message } = req.body;

    const progressValue = Number(percentage);

    if (
      Number.isNaN(progressValue) ||
      progressValue < 0 ||
      progressValue > 100
    ) {
      return res.status(400).json({
        message: "Progress must be between 0 and 100",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const loggedInUserId = req.user.id;

    const isAssignedClient =
      task.assignedTo &&
      task.assignedTo.toString() === loggedInUserId.toString();

    if (!isAssignedClient) {
      return res.status(403).json({
        message: "Only the assigned client can update progress",
      });
    }

    if (task.status === "completed") {
      return res.status(400).json({
        message: "Completed tasks cannot be updated",
      });
    }

    task.progress = progressValue;

    task.progressUpdates.push({
      percentage: progressValue,
      message: (message || "").trim(),
      updatedBy: loggedInUserId,
    });

    task.activityLog.push({
      action: `Progress Updated (${progressValue}%)`,
      icon: "📈",
      user: req.user.id,
      remarks: message || ""
    });

    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate("assignedTo", "name email")
      .populate("progressUpdates.updatedBy", "name email role");

   const notification = await Notification.create({
  userId: task.createdBy,
  type: "task_progress",
  message: `Client updated progress to ${progressValue}% on task: ${task.title}`,
  taskId: task._id,
  actionBy: loggedInUserId,
});

    const io = req.app.get("io");

    if (io) {
      io.to(task.createdBy.toString()).emit(
        "new_notification",
        notification
      );

      io.to(task.createdBy.toString()).emit("task_progress_updated", {
        taskId: task._id.toString(),
        task: updatedTask,
      });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Update task progress error:", error);

    res.status(500).json({
      message: "Failed to update task progress",
    });
  }
};




// 👑 Admin creates task
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      priority,
      deadline,
      workRequestId,
      taskCategory,
      customerName,
      phoneNumber,
      projectType,
      estimatedBudget,
      siteAddress,
      locationCoords,
      siteManager,
      accessHours,
    } = req.body;
    const io = req.app.get("io");

    // 🔥 IMPORTANT CHECK
    if (!assignedTo) {
      return res.status(400).json({ message: "assignedTo is required" });
    }

    // If workRequestId is supplied, validate it exists first
    let request = null;
    if (workRequestId) {
      request = await WorkRequest.findById(workRequestId);
      if (!request) {
        return res.status(404).json({
          message: "Work Request Not Found"
        });
      }
    }

    const fileUrls = req.files?.map(file => file.path) || [];

    const task = await Task.create({
      title,
      description,
      assignedTo,
      priority: priority || "medium",
      deadline: deadline || null,
      taskCategory: req.body.taskCategory,
      workMode: req.body.taskCategory,
      visitStatus:
        req.body.taskCategory === "field"
          ? "travelling"
          : "not-required",
      createdBy: req.user.id,
      files: fileUrls,
      customerName,
      phoneNumber,
      projectType,
      estimatedBudget,
      siteAddress,
      locationCoords,
      siteManager,
      accessHours,
      activityLog: [
        {
          action: "Task Assigned",
          icon: "📋",
          user: req.user.id,
          remarks: "Task assigned to engineer"
        }
      ]
    });

    if (request) {
      request.status = "assigned";
      request.assignedEngineer = assignedTo;
      request.convertedTask = task._id;
      await request.save();

      // Emit "workRequestAssigned" to immediately update dashboards
      if (io) {
        io.emit("workRequestAssigned", { workRequestId: request._id });
      }
    }

    await Activity.create({
      user: req.user.id,
      action: `Created and assigned task: ${title}`,
      taskId: task._id
    });

    // 📢 Create notification for assigned client
    const notification = await Notification.create({
      userId: assignedTo,
      type: "task_assigned",
      message: `New task assigned: ${title}`,
      taskId: task._id,
      actionBy: req.user.id
    });

    // 🔔 Real-time socket event
    io.emit("newNotification", notification);

    res.status(201).json(task);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 👨‍💻 Get tasks (role-based)
exports.getTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "admin") {
      tasks = await Task.find()
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({
        assignedTo: req.user.id
      }).sort({ createdAt: -1 });
    }

    res.json(tasks);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Mark complete
exports.completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only assigned client can complete
    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your task" });
      console.log("TASK ASSIGNED TO:", task.assignedTo.toString());
console.log("CURRENT USER:", req.user.id);
    }

    task.status = "completed";
    await task.save();

    res.json({
      message: "Task completed",
      task
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.submitTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const io = req.app.get("io");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // only assigned client
    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your task" });
    }

    console.log("FILES RECEIVED:", req.files);

const fileUrls = req.files?.map(file => file.path) || [];

    task.submissionFiles = fileUrls;
task.status = "completed";
task.reviewStatus = "pending";
task.submittedAt = new Date();

// Calculate final time only if the task was started
if (task.startedAt) {
  const millisecondsSpent =
    task.submittedAt.getTime() - task.startedAt.getTime();

  task.totalTimeSpent = Math.floor(millisecondsSpent / 1000);
}

    task.activityLog.push({
      action: "Submitted",
      icon: "📤",
      user: req.user.id
    });

    await task.save();

    await Activity.create({
      user: req.user.id,
      action: "Submitted Task",
      taskId: task._id
    });

    // 📢 Create notification for admin/creator
    const notification = await Notification.create({
      userId: task.createdBy,
      type: "task_submitted",
      message: `Task submitted for review: ${task.title}`,
      taskId: task._id,
      actionBy: req.user.id
    });

    // 🔔 Real-time socket event
    io.emit("newNotification", notification);

    res.json({
      message: "Work submitted successfully",
      task
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Start Task
exports.startTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your task" });
    }

    // Prevent restarting a task that already started
    if (task.startedAt) {
      return res.status(400).json({
        message: "Task has already been started"
      });
    }

    task.status = "in-progress";
    task.startedAt = new Date();

    task.activityLog.push({
      action: "Started",
      icon: "🚀",
      user: req.user.id
    });

    await task.save();
    await Activity.create({
  user: req.user.id,
  action: "Started task",
  taskId: task._id
});

    res.json({
      message: "Task started successfully",
      task
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Update Task (Admin only)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only admin can update
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedTask);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Review Task (Admin only)
exports.reviewTask = async (req, res) => {
  try {
    const { status } = req.body; // approved / rejected
    const io = req.app.get("io");

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    if (task.reviewStatus === "approved") {
      return res.status(400).json({ message: "Approved tasks are locked and cannot be changed" });
    }

    const { reason } = req.body;
    if (status !== "approved" && (!reason || !reason.trim())) {
      return res.status(400).json({ message: "Reason is required for rejection/rework/return actions" });
    }

    task.reviewStatus = status === "approved" ? "approved" : "rejected";

    let actionLabel = "Task Approved";
    let actionIcon = "✅";
    if (status === "rejected") {
      actionLabel = "Task Rejected";
      actionIcon = "❌";
    } else if (status === "rework") {
      actionLabel = "Rework Requested";
      actionIcon = "🔄";
    } else if (status === "return") {
      actionLabel = "Returned with Comments";
      actionIcon = "💬";
    }

    task.activityLog.push({
      action: actionLabel,
      icon: actionIcon,
      user: req.user.id,
      remarks: reason || "Approved by administrator"
    });

    await task.save();

    if (reason && reason.trim()) {
      const Comment = require("../models/Comment");
      await Comment.create({
        taskId: task._id,
        sender: req.user.id,
        message: `[Admin Review Note] ${reason.trim()}`
      });
    }

    await Activity.create({
      user: req.user.id,
      action: status === "approved" ? "Approved task" : "Returned/Rejected task",
      taskId: task._id
    });

    // 📢 Create notification for client
    const notificationType = status === "approved" ? "task_approved" : "task_rejected";
    const messageText = status === "approved" 
      ? `Task approved: ${task.title}` 
      : `Task needs revision: ${task.title}`;

    const notification = await Notification.create({
      userId: task.assignedTo,
      type: notificationType,
      message: messageText,
      taskId: task._id,
      actionBy: req.user.id
    });

    // 🔔 Real-time socket event
    io.emit("newNotification", notification);

    res.json({
      message: `Task ${status}`,
      task
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ❌ Delete Task (Admin only)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    await task.deleteOne();

    res.json({ message: "Task deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 📊 Get Task Statistics (Admin only)
exports.getStats = async (req, res) => {
  try {
    const total = await Task.countDocuments();
    const pending = await Task.countDocuments({ status: "pending" });
    const inProgress = await Task.countDocuments({ status: "in-progress" });
    const completed = await Task.countDocuments({ status: "completed" });

    res.json({
      total,
      pending,
      inProgress,
      completed
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📜 Get recent activity for admin dashboard
exports.getRecentActivities = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin only"
      });
    }

    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(12);

    res.json(activities);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

const addAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.assignedTo.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const fileUrls = req.files?.map(file => file.path) || [];
    task.files.push(...fileUrls);

    task.activityLog.push({
      action: "Attachment Uploaded",
      icon: "📎",
      user: req.user.id,
      remarks: `Uploaded ${fileUrls.length} file(s)`
    });

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVisitStatus = async (req, res) => {
  try {
    const { visitStatus } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.assignedTo.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    task.visitStatus = visitStatus;

    task.activityLog.push({
      action: `Status: ${visitStatus.toUpperCase().replace("-", " ")}`,
      icon: "🚗",
      user: req.user.id,
      remarks: `Visit status changed to ${visitStatus}`
    });

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addMaterial = async (req, res) => {
  try {
    const { name, qty, unit, remarks } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.materials.push({ name, qty, unit, remarks });

    task.activityLog.push({
      action: "Material Added",
      icon: "🧱",
      user: req.user.id,
      remarks: `${qty} ${unit} of ${name} added`
    });

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addTaskNote = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.notes.push({
      text,
      user: req.user.id,
      userName: req.user.name || req.user.email
    });

    task.activityLog.push({
      action: "Note Added",
      icon: "📝",
      user: req.user.id,
      remarks: text
    });

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const editTaskNote = async (req, res) => {
  try {
    const { text } = req.body;
    const { id, noteId } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const note = task.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to edit this note" });
    }

    note.text = text;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTaskNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const note = task.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this note" });
    }

    task.notes.pull(noteId);
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const submitCustomerSignOff = async (req, res) => {
  try {
    const { name, phone, remarks, rating, signature } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.customerSignName = name;
    task.customerSignPhone = phone;
    task.customerSignRemarks = remarks;
    task.customerSignRating = rating;
    task.customerSignature = signature;

    task.activityLog.push({
      action: "Customer Sign-off Submitted",
      icon: "✍️",
      user: req.user.id,
      remarks: `Signed by ${name} (Rating: ${rating}/5)`
    });

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateVisitStatus = updateVisitStatus;
exports.addAttachment = addAttachment;
exports.updateTaskProgress = updateTaskProgress;
exports.addMaterial = addMaterial;
exports.addTaskNote = addTaskNote;
exports.editTaskNote = editTaskNote;
exports.deleteTaskNote = deleteTaskNote;
exports.submitCustomerSignOff = submitCustomerSignOff;

