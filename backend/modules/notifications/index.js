const notificationRoutes = require("./routes/notificationRoutes");
const notificationController = require("./controllers/notificationController");
const Notification = require("./models/Notification");
const notificationServices = require("./services");
const notificationValidators = require("./validators");
const notificationUtils = require("./utils");
const notificationConstants = require("./constants");

module.exports = {
  routes: notificationRoutes,
  controllers: notificationController,
  services: notificationServices,
  validators: notificationValidators,
  utils: notificationUtils,
  constants: notificationConstants,
  models: {
    Notification
  }
};
