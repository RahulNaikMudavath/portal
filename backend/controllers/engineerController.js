const WorkOrder = require("../models/WorkOrder");

exports.getMyWorkOrders = async (req, res) => {
    try {

        const workOrders = await WorkOrder.find({
            engineer: req.user._id
        })
        .populate("workRequest")
        .populate("assignedBy", "name email");

        res.json(workOrders);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: err.message
        });
    }
};