const analyticsRoutes = require("./routes/analyticsRoutes");
const analyticsController = require("./controllers/analyticsController");
const analyticsServices = require("./services");
const analyticsModels = require("./models");
const analyticsValidators = require("./validators");
const analyticsUtils = require("./utils");
const analyticsConstants = require("./constants");

module.exports = {
  routes: analyticsRoutes,
  controllers: analyticsController,
  services: analyticsServices,
  models: analyticsModels,
  validators: analyticsValidators,
  utils: analyticsUtils,
  constants: analyticsConstants
};
