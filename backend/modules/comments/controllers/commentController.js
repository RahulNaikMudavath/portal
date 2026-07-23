const Comment = require("../../../modules/comments/models/Comment");
const Task = require("../../../modules/tasks/models/Task");
const Notification = require("../../../modules/notifications/models/Notification");

// Get all comments for one task
const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const loggedInUserId = req.user.id;
    const isAdmin = req.user.role === "admin";

    const isAssignedClient =
      task.assignedTo &&
      task.assignedTo.toString() === loggedInUserId.toString();

    // Only admin or the assigned client can view comments
    if (!isAdmin && !isAssignedClient) {
      return res.status(403).json({
        message: "You cannot view comments for this task",
      });
    }

    const comments = await Comment.find({ taskId })
      .populate("sender", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Get comments error:", error);

    res.status(500).json({
      message: "Failed to fetch comments",
    });
  }
};

// Add a new comment to one task
const addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { message, audioUrl } = req.body;

    if ((!message || !message.trim()) && !audioUrl) {
      return res.status(400).json({
        message: "Comment message or voice note is required",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const loggedInUserId = req.user.id;

    if (!loggedInUserId) {
      return res.status(401).json({
        message: "User authentication data is missing",
      });
    }

    const isAdmin = req.user.role === "admin";

    const isAssignedClient =
      task.assignedTo &&
      task.assignedTo.toString() === loggedInUserId.toString();

    // Only admin or the assigned client can comment
    if (!isAdmin && !isAssignedClient) {
      return res.status(403).json({
        message: "You cannot comment on this task",
      });
    }

    const comment = await Comment.create({
      taskId,
      sender: loggedInUserId,
      message: (message || "").trim() || (audioUrl ? "🎤 Voice Note" : ""),
      audioUrl: audioUrl || "",
    });

    task.activityLog.push({
      action: audioUrl ? "Voice Note Added" : "Note Added",
      icon: audioUrl ? "🎙️" : "📝",
      user: loggedInUserId,
      remarks: audioUrl ? "Voice Recording Attached" : (message || "").trim()
    });
    await task.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "sender",
      "name email role"
    );

    // Admin comment → notify client
    // Client comment → notify admin
    const receiverId = isAdmin ? task.assignedTo : task.createdBy;

    if (receiverId && receiverId.toString() !== loggedInUserId.toString()) {
      const notification = await Notification.create({
        userId: receiverId,
        type: "task_comment",
        message: `${req.user.name || "A user"} commented on task: ${task.title}`,
        taskId: task._id,
        createdBy: loggedInUserId,
      });

      const io = req.app.get("io");

      if (io) {
        io.to(receiverId.toString()).emit("new_notification", notification);

        io.to(receiverId.toString()).emit("new_task_comment", {
          taskId,
          comment: populatedComment,
        });
      }
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Add comment error:", error);

    res.status(500).json({
      message: "Failed to add comment",
    });
  }
};

module.exports = {
  getTaskComments,
  addTaskComment,
};