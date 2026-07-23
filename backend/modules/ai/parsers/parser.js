const extractBudget = require("../extractors/extractBudget");
const extractFloors = require("../extractors/extractFloors");
const extractProject = require("../extractors/extractProject");
const extractBuildingType = require("../extractors/extractBuildingType");
const extractPriority = require("../extractors/extractPriority");
const extractSubject = require("../extractors/extractSubject");
const extractEngineer = require("../extractors/extractEngineer");
const extractLocation = require("../extractors/extractLocation");
const generateSummary = require("../extractors/generateSummary");

/**
 * Parses conversation messages or a raw text string and returns an AI extraction object.
 * 
 * @param {Array|string} input - The array of message objects or a raw text string.
 * @returns {Promise<Object>} The unified AI extraction object.
 */
async function parse(input) {
  let text = "";

  if (Array.isArray(input)) {
    text = input
      .map((m) => m.text || "")
      .join(" ")
      .trim();
  } else if (typeof input === "string") {
    text = input.trim();
  }

  // Extract fields using the individual modular extractors
  const projectType = extractProject(text);
  const buildingType = extractBuildingType(text);
  const floors = extractFloors(text);
  const estimatedBudget = extractBudget(text);
  const location = extractLocation(text);
  const priority = extractPriority(text);
  const subject = extractSubject(text);
  
  // extractEngineer is asynchronous (DB and fallback checks)
  const suggestedEngineer = await extractEngineer(text);

  // generateSummary formats the final summary
  const summary = generateSummary(text, {
    projectType,
    buildingType,
    floors,
    estimatedBudget,
    location,
    priority,
    subject,
    suggestedEngineer
  });

  return {
    summary,
    projectType,
    buildingType,
    floors,
    estimatedBudget,
    location,
    priority,
    subject,
    suggestedEngineer
  };
}

module.exports = {
  parse
};
