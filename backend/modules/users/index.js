const userRoutes = require("./routes/userRoutes");
const userController = require("./controllers/userController");
const User = require("./models/User");
const userServices = require("./services");
const userValidators = require("./validators");
const userUtils = require("./utils");
const userConstants = require("./constants");

module.exports = {
  routes: userRoutes,
  controllers: userController,
  services: userServices,
  validators: userValidators,
  utils: userUtils,
  constants: userConstants,
  models: {
    User
  }
};
