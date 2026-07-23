const dashboardInitializationService = require("./services/dashboardInitializationService");
const DashboardSettings = require("./models/DashboardSettings");
const dashboardControllers = require("./controllers");
const dashboardRoutes = require("./routes");
const dashboardValidators = require("./validators");
const dashboardUtils = require("./utils");
const dashboardConstants = require("./constants");

module.exports = {
  routes: dashboardRoutes,
  controllers: dashboardControllers,
  services: {
    initialization: dashboardInitializationService
  },
  validators: dashboardValidators,
  utils: dashboardUtils,
  constants: dashboardConstants,
  models: {
    DashboardSettings
  }
};
