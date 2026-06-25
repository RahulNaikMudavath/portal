const Task = require("../models/Task");

const getAdminAnalytics = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .lean();

    const now = new Date();

    const totalTasks = tasks.length;

    const pendingTasks = tasks.filter(
      (task) => task.status === "pending"
    ).length;

    const inProgressTasks = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;

    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    const approvedTasks = tasks.filter(
      (task) => task.reviewStatus === "approved"
    ).length;

    const rejectedTasks = tasks.filter(
      (task) => task.reviewStatus === "rejected"
    ).length;

    const overdueTasks = tasks.filter((task) => {
      return (
        task.deadline &&
        new Date(task.deadline) < now &&
        task.status !== "completed"
      );
    }).length;

    const highPriorityTasks = tasks.filter(
      (task) => task.priority === "high"
    ).length;

    const completedWithTime = tasks.filter(
      (task) =>
        task.status === "completed" &&
        typeof task.totalTimeSpent === "number" &&
        task.totalTimeSpent > 0
    );

    const averageCompletionTime =
      completedWithTime.length > 0
        ? Math.round(
            completedWithTime.reduce(
              (total, task) => total + task.totalTimeSpent,
              0
            ) / completedWithTime.length
          )
        : 0;

    const workloadMap = {};

    tasks.forEach((task) => {
      if (!task.assignedTo) return;

      const clientId = task.assignedTo._id.toString();

      if (!workloadMap[clientId]) {
        workloadMap[clientId] = {
          clientId,
          clientName: task.assignedTo.name,
          email: task.assignedTo.email,
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          overdue: 0,
        };
      }

      workloadMap[clientId].total += 1;

      if (task.status === "pending") {
        workloadMap[clientId].pending += 1;
      }

      if (task.status === "in-progress") {
        workloadMap[clientId].inProgress += 1;
      }

      if (task.status === "completed") {
        workloadMap[clientId].completed += 1;
      }

      if (
        task.deadline &&
        new Date(task.deadline) < now &&
        task.status !== "completed"
      ) {
        workloadMap[clientId].overdue += 1;
      }
    });

    const clientWorkload = Object.values(workloadMap).sort(
      (a, b) => b.total - a.total
    );

    res.status(200).json({
      overview: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        approvedTasks,
        rejectedTasks,
        overdueTasks,
        highPriorityTasks,
        averageCompletionTime,
      },
      clientWorkload,
    });
  } catch (error) {
    console.error("Get analytics error:", error);

    res.status(500).json({
      message: "Failed to fetch analytics",
    });
  }
};

module.exports = {
  getAdminAnalytics,
};