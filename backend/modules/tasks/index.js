const taskRoutes = require("./routes/taskRoutes");
const taskController = require("./controllers/taskController");
const taskServices = require("./services");
const taskValidators = require("./validators");
const taskUtils = require("./utils");
const taskConstants = require("./constants");
const Task = require("./models/Task");
const EnterpriseTask = require("./models/EnterpriseTask");

module.exports = {
  routes: taskRoutes,
  controllers: taskController,
  services: taskServices,
  validators: taskValidators,
  utils: taskUtils,
  constants: taskConstants,
  models: {
    Task,
    EnterpriseTask
  }
};
