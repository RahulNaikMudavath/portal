const WorkOrder = require("../models/WorkOrder");
const WorkRequest = require("../models/WorkRequest");

exports.createWorkOrder = async (req, res) => {
  try {
    console.log("BODY:");
    console.log(req.body);

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

    console.log("Logged in user:");
console.log(req.user);
console.log("Assigned By:", req.user.id);
    // Create Work Order
    const workOrder = await WorkOrder.create({
    workRequest,
    engineer,
    priority,
    deadline: deadline || null,
    estimatedBudget,
    notes,
    assignedBy: req.user._id
});
    // Update Work Request
    request.status = "assigned";
request.assignedEngineer = engineer;
request.convertedTask = workOrder._id;

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