/**
 * Extracts the subject / work request service classification.
 * Matches to standard categories or defaults to "General Work Request".
 * 
 * @param {string} text - The input text.
 * @returns {string} The identified subject/service category.
 */
function extractSubject(text) {
  if (!text) return "General Work Request";

  if (/\bquotation\b/i.test(text)) {
      return "Quotation Request";
  }
  if (/\bestimation\b/i.test(text)) {
      return "House Estimation";
  }
  if (/\brenovation\b/i.test(text)) {
      return "Renovation Project";
  }
  if (/\belectrical\b/i.test(text)) {
      return "Electrical Work";
  }
  if (/\bplumbing\b/i.test(text)) {
      return "Plumbing Work";
  }
  if (/\binterior\b/i.test(text)) {
      return "Interior Design";
  }
  if (/\bpainting\b/i.test(text)) {
      return "Painting Work";
  }
  if (/\bcctv\b/i.test(text)) {
      return "CCTV Installation";
  }
  if (/\bsolar\b/i.test(text)) {
      return "Solar Installation";
  }
  if (/\bborewell\b/i.test(text)) {
      return "Borewell Work";
  }
  if (/\bconstruction\b/i.test(text) || /\b(build|house|villa|building)\b/i.test(text)) {
      return "Construction Work";
  }

  return "General Work Request";
}

module.exports = extractSubject;
