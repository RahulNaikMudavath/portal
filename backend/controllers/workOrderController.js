const WorkOrder = require("../models/WorkOrder");
const WorkRequest = require("../models/WorkRequest");

exports.createWorkOrder = async (req, res) => {
  try {
    const {
      workRequest,
      engineer,
      priority,
      deadline,
      estimatedBudget,
      notes,
    } = req.body;

    // Check Work Request
    const request = await WorkRequest.findById(workRequest);

    if (!request) {
      return res.status(404).json({
        message: "Work Request not found",
      });
    }

    // Create Work Order
    const workOrder = await WorkOrder.create({
      workRequest,
      engineer,
      assignedBy: req.user?._id || null,
      priority,
      deadline,
      estimatedBudget,
      notes,
    });

    // Update Work Request
    request.status = "assigned";
    await request.save();

    res.status(201).json({
      message: "Work Order Created Successfully",
      workOrder,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};