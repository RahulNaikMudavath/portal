const engineerRoutes = require("./routes/engineerRoutes");
const engineerController = require("./controllers/engineerController");
const availabilityService = require("./services/availabilityService");
const locationService = require("./services/locationService");
const assignmentService = require("./services/assignmentService");
const engineerModels = require("./models");

module.exports = {
  routes: engineerRoutes,
  controllers: engineerController,
  services: {
    availability: availabilityService,
    location: locationService,
    assignment: assignmentService
  },
  models: engineerModels
};
