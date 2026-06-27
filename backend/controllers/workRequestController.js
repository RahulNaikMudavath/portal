const Task = require("../models/Task");
const User = require("../models/User");
const WorkRequest = require("../models/WorkRequest");

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

    const task = await Task.create({
      title: request.subject,
      description:
        request.description +
        "\n\nInternal Notes:\n" +
        notes,
      assignedTo: assignedEngineer,
      priority,
      deadline,
      createdBy: req.user.id,
    });

    request.convertedTask = task._id;
    request.assignedEngineer = assignedEngineer;
    request.status = "assigned";

    await request.save();

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

// Create
const createWorkRequest = async (req, res) => {
  try {
    

    const workRequest = await WorkRequest.create(req.body);

    res.status(201).json(workRequest);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create work request",
    });
  }
};

// Get All
const getAllWorkRequests = async (req, res) => {
  try {
    const requests = await WorkRequest.find()
      .populate("assignedEngineer", "name email")
      .sort({
        createdAt: -1,
      });

    res.json(requests);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch work requests",
    });
  }
};

// Get One
const getWorkRequest = async (req, res) => {
  try {
    const request = await WorkRequest.findById(
      req.params.id
    )
      .populate("assignedEngineer", "name email")
      .populate("convertedTask");

    if (!request) {
      return res.status(404).json({
        message: "Work Request not found",
      });
    }

    res.json(request);
  } catch (error) {
    console.error(error);

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