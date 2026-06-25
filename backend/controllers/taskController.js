const Task = require("../models/Task");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");




// 👑 Admin creates task
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;
    const io = req.app.get("io");

    // 🔥 IMPORTANT CHECK
    if (!assignedTo) {
      return res.status(400).json({ message: "assignedTo is required" });
    }

    const fileUrls = req.files?.map(file => file.path) || [];

    const task = await Task.create({
      title,
      description,
      assignedTo,
      createdBy: req.user.id,
      files: fileUrls
    });
    await Activity.create({
  user: req.user.id,
  action: `Created and assigned task: ${title}`,
  taskId: task._id
});

    // 📢 Create notification for assigned client
    const notification = await Notification.create({
      userId: assignedTo,
      type: "task_created",
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

    task.reviewStatus = status;

    await task.save();
    await Activity.create({
  user: req.user.id,
  action: status === "approved" ? "Approved task" : "Rejected task",
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