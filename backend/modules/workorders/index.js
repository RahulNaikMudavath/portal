const workOrderRoutes = require("./routes/workOrderRoutes");
const workOrderController = require("./controllers/workOrderController");
const WorkOrder = require("./models/WorkOrder");
const workOrderServices = require("./services");
const workOrderValidators = require("./validators");
const workOrderUtils = require("./utils");
const workOrderConstants = require("./constants");

module.exports = {
  routes: workOrderRoutes,
  controllers: workOrderController,
  services: workOrderServices,
  validators: workOrderValidators,
  utils: workOrderUtils,
  constants: workOrderConstants,
  models: {
    WorkOrder
  }
};
