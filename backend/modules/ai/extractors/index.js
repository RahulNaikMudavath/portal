const extractBudget = require("./extractBudget");
const extractFloors = require("./extractFloors");
const extractProject = require("./extractProject");
const extractBuildingType = require("./extractBuildingType");
const extractPriority = require("./extractPriority");
const extractSubject = require("./extractSubject");
const extractEngineer = require("./extractEngineer");
const extractLocation = require("./extractLocation");
const generateSummary = require("./generateSummary");

module.exports = {
  extractBudget,
  extractFloors,
  extractProject,
  extractBuildingType,
  extractPriority,
  extractSubject,
  extractEngineer,
  extractLocation,
  generateSummary
};
