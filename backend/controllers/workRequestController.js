const Task = require("../models/Task");
const User = require("../models/User");
const WorkRequest = require("../models/WorkRequest");
const Activity = require("../models/Activity");
const Notification = require("../models/Notification");
const { analyzeConversation } = require("../services/aiService");

const convertToWorkOrder = async (req, res) => {
  try {
    const request = await WorkRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Work Request not found",
      });
    }

    const {
      assignedEngineer,
      priority,
      deadline,
      budget,
      notes,
    } = req.body;

    const taskPriority = priority === "urgent" ? "high" : priority;

    const task = await Task.create({
      title: request.subject,
      description:
        request.description +
        "\n\nInternal Notes:\n" +
        (notes || ""),
      assignedTo: assignedEngineer,
      priority: taskPriority,
      deadline,
      createdBy: req.user.id,
    });

    request.convertedTask = task._id;
    request.assignedEngineer = assignedEngineer;
    request.status = "assigned";
    if (priority) {
      request.priority = priority.toLowerCase();
    }
    if (budget !== undefined) {
      request.estimatedBudget = Number(budget) || 0;
    }

    await request.save();

    // Log Activity
    await Activity.create({
      user: req.user.id,
      action: `Converted work request to task: ${request.subject}`,
      taskId: task._id
    });

    // Create Notification
    const notification = await Notification.create({
      userId: assignedEngineer,
      type: "task_assigned",
      message: `New task assigned: ${request.subject}`,
      taskId: task._id,
      actionBy: req.user.id
    });

    // Socket notify
    const io = req.app.get("io");
    if (io) {
      io.emit("newNotification", notification);
      io.emit("workRequestAssigned", { workRequestId: request._id });
    }

    res.json({
      message: "Converted successfully",
      task,
      request,
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Conversion failed",
    });
  }
};

const createWorkRequest = async (req, res) => {
  try {

    console.log("Incoming Request:");
    console.log(req.body);

    // AI Analysis
    const ai = await analyzeConversation([
      {
        text: req.body.description || "",
      },
    ]);

    console.log("AI Response:");
    console.log(ai);

    // Normalize input priority and source
    const priorityVal = (req.body.priority || ai.priority || "medium").toLowerCase();
    const sourceVal = (req.body.source || "whatsapp").toLowerCase();

    // Safely parse estimatedBudget to Number
    let budgetNum = 0;
    if (req.body.estimatedBudget) {
      budgetNum = Number(String(req.body.estimatedBudget).replace(/\D/g, "")) || 0;
    } else {
      const budgetStr = ai.estimatedBudget || ai.extractedFields?.budget;
      if (budgetStr) {
        budgetNum = Number(String(budgetStr).replace(/\D/g, "")) || 0;
      }
    }

    const workRequest = await WorkRequest.create({
      customerName:
        req.body.customerName || "Unknown Customer",

      companyName:
        req.body.companyName || "",

      phoneNumber:
        req.body.phoneNumber || "",

      whatsappNumber:
        req.body.phoneNumber || "",

      email:
        req.body.email || "",

      source:
        sourceVal,

      projectName:
        req.body.projectName || "",

      projectType:
        req.body.projectType ||
        ai.projectType ||
        ai.extractedFields?.projectType ||
        "Other",

      siteAddress:
        req.body.siteAddress || "",

      googleMapsLink:
        "",

      subject:
        req.body.subject ||
        ai.subject ||
        "General Work Request",

      description:
        req.body.description || "",

      estimatedBudget:
        budgetNum,

      priority:
        priorityVal,

      aiSummary:
        ai.summary || "",

      conversation: [],

      assignedEngineer:
        req.body.assignedEngineer || null,

      status:
        req.body.assignedEngineer ? "assigned" : "new",
    });

    // If an engineer was assigned during creation, create the corresponding Task document
    if (req.body.assignedEngineer) {
      const taskPriority = workRequest.priority === "urgent" ? "high" : workRequest.priority;
      const task = await Task.create({
        title: workRequest.subject,
        description:
          workRequest.description +
          "\n\nInternal Notes:\n" +
          (req.body.notes || ""),
        assignedTo: req.body.assignedEngineer,
        priority: taskPriority,
        deadline: req.body.preferredVisitDate || null,
        createdBy: req.user.id,
      });

      workRequest.convertedTask = task._id;
      await workRequest.save();

      // Log Activity
      await Activity.create({
        user: req.user.id,
        action: `Created and assigned task: ${workRequest.subject}`,
        taskId: task._id
      });

      // Create Notification
      const notification = await Notification.create({
        userId: req.body.assignedEngineer,
        type: "task_assigned",
        message: `New task assigned: ${workRequest.subject}`,
        taskId: task._id,
        actionBy: req.user.id
      });

      // Socket notify
      const io = req.app.get("io");
      if (io) {
        io.emit("newNotification", notification);
      }
    }

    console.log("Work Request Created:");
    console.log(workRequest);

    res.status(201).json(workRequest);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

const getAllWorkRequests = async (req, res) => {
  try {

    const requests = await WorkRequest.find()
      .populate("assignedEngineer", "name email")
      .sort({
        createdAt: -1,
      });

    res.json(requests);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to fetch work requests",
    });
  }
};

const getWorkRequest = async (req, res) => {
  try {

    const request = await WorkRequest.findById(req.params.id)
      .populate("assignedEngineer", "name email")
      .populate("convertedTask");

    if (!request) {
      return res.status(404).json({
        message: "Work Request not found",
      });
    }

    res.json(request);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to fetch work request",
    });
  }
};

module.exports = {
  createWorkRequest,
  getAllWorkRequests,
  getWorkRequest,
  convertToWorkOrder,
};