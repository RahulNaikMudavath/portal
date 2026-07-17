const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  checkConflicts
} = require("../controllers/calendarController");

router.get("/", protect, getEvents);
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);
router.post("/check-conflicts", protect, checkConflicts);

module.exports = router;
