const CalendarEvent = require("../../../modules/calendar/models/CalendarEvent");
const googleCalendarService = require("../../../modules/calendar/services/googleCalendarService");

// Helper to find overlapping events for specified engineers
const checkConflictHelper = async (start, end, engineers, excludeEventId = null) => {
  if (!engineers || engineers.length === 0) return [];

  const query = {
    engineers: { $in: engineers },
    start: { $lt: new Date(end) },
    end: { $gt: new Date(start) }
  };

  if (excludeEventId) {
    query._id = { $ne: excludeEventId };
  }

  // Populate engineer names for better reporting in conflict warnings
  return CalendarEvent.find(query)
    .populate("engineers", "name")
    .populate("project", "name")
    .lean();
};

// 📅 Get calendar events
const getEvents = async (req, res) => {
  try {
    let events;

    // Admins see all events in organization, client/engineers see only their scheduled events
    if (req.user.role === "admin") {
      const org = req.user.organization || req.user.company || "";
      let query = { createdBy: req.user.id };
      if (org) {
        const User = require("../../../modules/users/models/User");
        const adminsInOrg = await User.find({
          $or: [
            { organization: org },
            { company: org }
          ]
        }).distinct("_id");
        if (adminsInOrg.length > 0) {
          query = { createdBy: { $in: adminsInOrg } };
        }
      }
      events = await CalendarEvent.find(query)
        .populate("engineers", "_id name email rollNumber")
        .populate("project", "_id name customerName location")
        .populate("task", "_id title status")
        .sort({ start: 1 });
    } else {
      events = await CalendarEvent.find({
        engineers: req.user.id
      })
        .populate("engineers", "_id name email rollNumber")
        .populate("project", "_id name customerName location")
        .populate("task", "_id title status")
        .sort({ start: 1 });
    }

    res.status(200).json(events);
  } catch (error) {
    console.error("Get calendar events error:", error);
    res.status(500).json({ message: "Failed to fetch calendar events" });
  }
};

// 📅 Create calendar event
const createEvent = async (req, res) => {
  try {
    const { title, description, eventType, project, task, start, end, engineers, location, allDay } = req.body;

    if (!title || !eventType || !start || !end) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (new Date(start) >= new Date(end)) {
      return res.status(400).json({ message: "Start date must be before end date" });
    }

    // Check for scheduling conflicts
    const conflicts = await checkConflictHelper(start, end, engineers);
    const hasConflicts = conflicts.length > 0;

    // Create event doc
    let event = new CalendarEvent({
      title,
      description,
      eventType,
      project: project || null,
      task: task || null,
      start,
      end,
      engineers: engineers || [],
      createdBy: req.user.id,
      location,
      allDay: allDay || false
    });

    // Mock Google Calendar Sync
    const syncData = await googleCalendarService.syncEventToGoogle(event);
    if (syncData) {
      event.gcalEventId = syncData.gcalEventId || null;
      event.gcalSyncStatus = syncData.gcalSyncStatus;
      event.gcalLastSyncedAt = syncData.gcalLastSyncedAt || null;
    }

    await event.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("calendarUpdate", { eventId: event._id });
      (event.engineers || []).forEach(async (engId) => {
        try {
          const Notification = require("../../../modules/notifications/models/Notification");
          const notif = await Notification.create({
            userId: engId,
            type: "calendar_updated",
            message: `📅 Admin assigned new schedule: "${event.title}"`,
            actionBy: req.user.id
          });
          io.emit("newNotification", notif);
        } catch (e) {}
      });
    }

    const populatedEvent = await CalendarEvent.findById(event._id)
      .populate("engineers", "_id name email rollNumber")
      .populate("project", "_id name customerName")
      .populate("task", "_id title");

    // Return event and warnings if conflicts exist
    res.status(201).json({
      event: populatedEvent,
      conflictDetected: hasConflicts,
      conflicts: hasConflicts ? conflicts : []
    });
  } catch (error) {
    console.error("Create calendar event error:", error);
    res.status(500).json({ message: "Failed to create calendar event" });
  }
};

// 📅 Update calendar event (supports drag & drop rescheduling)
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, eventType, project, task, start, end, engineers, location, allDay } = req.body;

    const event = await CalendarEvent.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Calendar event not found" });
    }

    // Checking update permissions (only creators or admins can edit calendar schedules)
    if (req.user.role !== "admin" && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this calendar event" });
    }

    const updatedStart = start || event.start;
    const updatedEnd = end || event.end;
    const updatedEngineers = engineers || event.engineers;

    if (new Date(updatedStart) >= new Date(updatedEnd)) {
      return res.status(400).json({ message: "Start date must be before end date" });
    }

    // Check conflicts excluding this event
    const conflicts = await checkConflictHelper(updatedStart, updatedEnd, updatedEngineers, id);
    const hasConflicts = conflicts.length > 0;

    // Apply updates
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (eventType !== undefined) event.eventType = eventType;
    if (project !== undefined) event.project = project || null;
    if (task !== undefined) event.task = task || null;
    if (start !== undefined) event.start = start;
    if (end !== undefined) event.end = end;
    if (engineers !== undefined) event.engineers = engineers;
    if (location !== undefined) event.location = location;
    if (allDay !== undefined) event.allDay = allDay;

    // Google Calendar Sync mock
    const syncData = await googleCalendarService.syncEventToGoogle(event);
    if (syncData) {
      event.gcalEventId = syncData.gcalEventId || event.gcalEventId;
      event.gcalSyncStatus = syncData.gcalSyncStatus;
      event.gcalLastSyncedAt = syncData.gcalLastSyncedAt || event.gcalLastSyncedAt;
    }

    await event.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("calendarUpdate", { eventId: event._id });
      (event.engineers || []).forEach(async (engId) => {
        try {
          const Notification = require("../../../modules/notifications/models/Notification");
          const notif = await Notification.create({
            userId: engId,
            type: "calendar_updated",
            message: `📅 Admin updated schedule: "${event.title}"`,
            actionBy: req.user.id
          });
          io.emit("newNotification", notif);
        } catch (e) {}
      });
    }

    const populatedEvent = await CalendarEvent.findById(event._id)
      .populate("engineers", "_id name email rollNumber")
      .populate("project", "_id name customerName")
      .populate("task", "_id title");

    res.status(200).json({
      event: populatedEvent,
      conflictDetected: hasConflicts,
      conflicts: hasConflicts ? conflicts : []
    });
  } catch (error) {
    console.error("Update calendar event error:", error);
    res.status(500).json({ message: "Failed to update calendar event" });
  }
};

// 📅 Delete calendar event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await CalendarEvent.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Calendar event not found" });
    }

    if (req.user.role !== "admin" && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this calendar event" });
    }

    // Google sync delete mock
    if (event.gcalEventId) {
      await googleCalendarService.deleteEventFromGoogle(event.gcalEventId);
    }

    await CalendarEvent.findByIdAndDelete(id);

    res.status(200).json({ message: "Calendar event deleted successfully" });
  } catch (error) {
    console.error("Delete calendar event error:", error);
    res.status(500).json({ message: "Failed to delete calendar event" });
  }
};

// 🔍 Check conflicts without saving
const checkConflicts = async (req, res) => {
  try {
    const { start, end, engineers, excludeEventId } = req.body;

    if (!start || !end || !engineers) {
      return res.status(400).json({ message: "Missing start, end, or engineers parameters" });
    }

    const conflicts = await checkConflictHelper(start, end, engineers, excludeEventId);
    
    res.status(200).json({
      conflictDetected: conflicts.length > 0,
      conflicts
    });
  } catch (error) {
    console.error("Conflict checking error:", error);
    res.status(500).json({ message: "Failed to check calendar conflicts" });
  }
};

// 📅 Export iCalendar .ics Feed for Phone / Google / Apple Calendar Sync
const formatDateToIcs = (date) => {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

const generateIcsContent = (events) => {
  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AdminClientPortal//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Admin Portal Tasks & Events",
    "X-WR-TIMEZONE:UTC"
  ];

  events.forEach((ev) => {
    const start = formatDateToIcs(ev.start);
    const end = formatDateToIcs(ev.end || new Date(new Date(ev.start).getTime() + 3600000));
    const title = (ev.title || "Portal Activity").replace(/,/g, "\\,");
    const desc = (ev.description || "Activity logged in Admin Portal").replace(/\n/g, "\\n").replace(/,/g, "\\,");
    const loc = (ev.location || "Portal Workspace").replace(/\n/g, "\\n").replace(/,/g, "\\,");

    ics.push(
      "BEGIN:VEVENT",
      `UID:${ev._id}@adminportal.com`,
      `DTSTAMP:${formatDateToIcs(new Date())}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${loc}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      `DESCRIPTION:Phone Reminder: ${title}`,
      "END:VALARM",
      "END:VEVENT"
    );
  });

  ics.push("END:VCALENDAR");
  return ics.join("\r\n");
};

const exportIcsFeed = async (req, res) => {
  try {
    const events = await CalendarEvent.find().sort({ start: 1 }).lean();
    const icsContent = generateIcsContent(events);
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", 'inline; filename="admin-portal-calendar.ics"');
    res.status(200).send(icsContent);
  } catch (error) {
    console.error("ICS Feed Export error:", error);
    res.status(500).send("Error generating ICS feed");
  }
};

const downloadSingleIcs = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await CalendarEvent.findById(id).lean();
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    const icsContent = generateIcsContent([event]);
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="event-${id}.ics"`);
    res.status(200).send(icsContent);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate event ICS file" });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  checkConflicts,
  exportIcsFeed,
  downloadSingleIcs
};
