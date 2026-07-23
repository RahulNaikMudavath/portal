const workRequestRoutes = require("./routes/workRequestRoutes");
const workRequestController = require("./controllers/workRequestController");
const workRequestService = require("./services/workRequestService");
const workRequestValidators = require("./validators");
const workRequestUtils = require("./utils");
const workRequestConstants = require("./constants");
const WorkRequest = require("./models/WorkRequest");

module.exports = {
  routes: workRequestRoutes,
  controllers: workRequestController,
  service: workRequestService,
  validators: workRequestValidators,
  utils: workRequestUtils,
  constants: workRequestConstants,
  models: {
    WorkRequest
  }
};
