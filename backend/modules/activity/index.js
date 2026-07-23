const Activity = require("./models/Activity");
const activityControllers = require("./controllers");
const activityRoutes = require("./routes");
const activityServices = require("./services");
const activityValidators = require("./validators");
const activityUtils = require("./utils");
const activityConstants = require("./constants");

module.exports = {
  routes: activityRoutes,
  controllers: activityControllers,
  services: activityServices,
  validators: activityValidators,
  utils: activityUtils,
  constants: activityConstants,
  models: {
    Activity
  }
};
