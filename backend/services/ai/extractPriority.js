/**
 * Extracts the priority of the work request from the text.
 * Mapped to "High", "Medium", or "Low".
 * 
 * @param {string} text - The input text.
 * @returns {string} The matched priority, defaulting to "Medium".
 */
function extractPriority(text) {
  if (!text) return "Medium";

  const urgentPatterns = [
      /\burgent\b/i,
      /\btoday\b/i,
      /\basap\b/i,
      /\bimmediately\b/i,
      /\bcritical\b/i,
      /\bsite\s+ready\b/i,
      /\bwork\s+immediately\b/i,
      /\bstarting\s+tomorrow\b/i
  ];
  const mediumPatterns = [
      /\bestimate\b/i,
      /\bquotation\b/i,
      /\binspection\b/i,
      /\bvisit\b/i
  ];
  const lowPatterns = [
      /\bnext\s+year\b/i,
      /\bproposal\b/i,
      /\bfuture\b/i
  ];

  if (urgentPatterns.some(regex => regex.test(text))) {
      return "High";
  }
  if (lowPatterns.some(regex => regex.test(text))) {
      return "Low";
  }
  if (mediumPatterns.some(regex => regex.test(text))) {
      return "Medium";
  }

  return "Medium";
}

module.exports = extractPriority;
