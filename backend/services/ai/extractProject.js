/**
 * Extracts and maps the project type to a predefined set of enums:
 * "Residential", "Commercial", "Industrial", "Institutional", "Other".
 * 
 * @param {string} text - The input text.
 * @returns {string} The mapped project type.
 */
function extractProject(text) {
  if (!text) return "Other";

  if (/\b(?:villa|house|home|apartment|flat|residential)\b/i.test(text)) {
      return "Residential";
  }
  if (/\b(?:office|commercial|shop|mall|restaurant|hotel)\b/i.test(text)) {
      return "Commercial";
  }
  if (/\b(?:warehouse|factory|plant|manufacturing|industrial)\b/i.test(text)) {
      return "Industrial";
  }
  if (/\b(?:hospital|school|college|university|institutional)\b/i.test(text)) {
      return "Institutional";
  }

  return "Other";
}

module.exports = extractProject;
