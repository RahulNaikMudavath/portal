const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const authController = require("./controllers/authController");
const authServices = require("./services");
const authValidators = require("./validators");
const authUtils = require("./utils");
const authConstants = require("./constants");
const authModels = require("./models");

module.exports = {
  routes: {
    auth: authRoutes,
    test: testRoutes
  },
  controllers: authController,
  services: authServices,
  validators: authValidators,
  utils: authUtils,
  constants: authConstants,
  models: authModels
};
