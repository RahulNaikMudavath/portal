/**
 * Extracts floor count information from the provided text using heuristics.
 * 
 * @param {string} text - The input text.
 * @returns {string} The extracted floors string (e.g. "G+2", "5 Floors", "Duplex"), or "" if not found.
 */
function extractFloors(text) {
  if (!text) return "";

  // 1. G+N or Ground + N
  const gMatch = text.match(/g(?:round)?\s*\+\s*(\d+)\b/i);
  if (gMatch) {
      return `G+${gMatch[1]}`;
  }
  
  // 2. N Floors or N Storey
  const numFloorMatch = text.match(/\b(\d+)\s*-?\s*(?:floor|storey)s?\b/i);
  if (numFloorMatch) {
      return `${numFloorMatch[1]} Floors`;
  }
  
  // 3. Duplex
  if (/\bduplex\b/i.test(text)) {
      return "Duplex";
  }

  return "";
}

module.exports = extractFloors;
