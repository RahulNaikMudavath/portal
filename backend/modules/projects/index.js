const projectRoutes = require("./routes/projectRoutes");
const projectController = require("./controllers/projectController");
const projectService = require("./services/projectService");
const timelineService = require("./services/timelineService");
const statisticsService = require("./services/statisticsService");
const projectValidators = require("./validators");
const Project = require("./models/Project");

module.exports = {
  routes: projectRoutes,
  controllers: projectController,
  services: {
    project: projectService,
    timeline: timelineService,
    statistics: statisticsService
  },
  validators: projectValidators,
  models: {
    Project
  }
};
