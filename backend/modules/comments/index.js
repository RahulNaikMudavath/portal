const commentRoutes = require("./routes/commentRoutes");
const commentController = require("./controllers/commentController");
const Comment = require("./models/Comment");
const commentServices = require("./services");
const commentValidators = require("./validators");
const commentUtils = require("./utils");
const commentConstants = require("./constants");

module.exports = {
  routes: commentRoutes,
  controllers: commentController,
  services: commentServices,
  validators: commentValidators,
  utils: commentUtils,
  constants: commentConstants,
  models: {
    Comment
  }
};
