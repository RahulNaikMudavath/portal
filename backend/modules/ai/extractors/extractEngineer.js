/**
 * Automatically suggests the appropriate engineer/supervisor role based on text keywords.
 * 
 * @param {string} text - The input text.
 * @returns {Promise<string>} The suggested engineer role, or "" if not found.
 */
async function extractEngineer(text) {
  if (!text) return "";

  // Check specific specialties first, then fall back to building types
  if (/\belectrical\b/i.test(text)) {
      return "Electrical Engineer";
  }
  if (/\binterior\b/i.test(text)) {
      return "Interior Designer";
  }
  if (/\bpainting\b/i.test(text)) {
      return "Painting Supervisor";
  }
  if (/\bplumbing\b/i.test(text)) {
      return "Plumbing Engineer";
  }
  if (/\bsolar\b/i.test(text)) {
      return "Solar Engineer";
  }
  if (/\bcctv\b/i.test(text)) {
      return "Security Engineer";
  }
  if (/\bnetworking\b/i.test(text)) {
      return "Network Engineer";
  }
  if (/\bhvac\b/i.test(text)) {
      return "HVAC Engineer";
  }
  if (/\bfire\s+safety\b/i.test(text)) {
      return "Fire Safety Engineer";
  }
  if (/\b(?:house|villa|office)\b/i.test(text)) {
      return "Civil Engineer";
  }

  return "";
}

module.exports = extractEngineer;
