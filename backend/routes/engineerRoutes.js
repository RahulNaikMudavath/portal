const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getMyWorkOrders } = require("../controllers/engineerController");

router.get("/my-workorders", protect, getMyWorkOrders);

module.exports = router;