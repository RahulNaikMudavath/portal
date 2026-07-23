const express = require("express");
const router = express.Router();
const { protect } = require("../../../middleware/authMiddleware");

const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  checkConflicts,
  exportIcsFeed,
  downloadSingleIcs
} = require("../controllers/calendarController");

// Public live .ics subscription feed for phone calendar sync (Apple Calendar, Google Calendar, Outlook)
router.get("/feed/admin-calendar.ics", exportIcsFeed);
router.get("/:id/export.ics", downloadSingleIcs);

router.get("/", protect, getEvents);
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);
router.post("/check-conflicts", protect, checkConflicts);

module.exports = router;
