const calendarRoutes = require("./routes/calendarRoutes");
const calendarController = require("./controllers/calendarController");
const googleCalendarService = require("./services/googleCalendarService");
const CalendarEvent = require("./models/CalendarEvent");
const calendarValidators = require("./validators");
const calendarUtils = require("./utils");
const calendarConstants = require("./constants");

module.exports = {
  routes: calendarRoutes,
  controllers: calendarController,
  services: {
    googleCalendar: googleCalendarService
  },
  validators: calendarValidators,
  utils: calendarUtils,
  constants: calendarConstants,
  models: {
    CalendarEvent
  }
};
