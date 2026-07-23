const documentRoutes = require("./routes/documentRoutes");
const documentController = require("./controllers/documentController");
const Document = require("./models/Document");
const documentServices = require("./services");
const documentValidators = require("./validators");
const documentUtils = require("./utils");
const documentConstants = require("./constants");

module.exports = {
  routes: documentRoutes,
  controllers: documentController,
  services: documentServices,
  validators: documentValidators,
  utils: documentUtils,
  constants: documentConstants,
  models: {
    Document
  }
};
