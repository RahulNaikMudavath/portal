/**
 * Extracts location, address, or area information from the text.
 * Handles phrases like:
 * - in Whitefield
 * - at Electronic City
 * - near MG Road
 * - Site at Indiranagar
 * - Location: HSR Layout
 * 
 * @param {string} text - The input text.
 * @returns {string} The extracted location or address, or "" if not found.
 */
function extractLocation(text) {
  if (!text) return "";

  // Matches 'location:', 'site at', 'in', 'at', 'near'
  const locationRegex = /(?:location\s*:\s*|site\s+at\s+|\bin\s+|\bat\s+|\bnear\s+)([a-z0-9\s,.-]+)/i;
  const match = text.match(locationRegex);
  if (!match) return "";

  const rawLoc = match[1];
  const words = rawLoc.split(/\s+/);
  
  // Stop words to truncate location extraction to prevent capturing trailing message clauses
  const stopWords = new Set([
      "budget", "cost", "need", "required", "urgent", "visit", "is", "for", "a",
      "g", "floor", "floors", "duplex", "villa", "house", "apartment", "flat",
      "office", "commercial", "warehouse", "hospital", "school", "restaurant",
      "hotel", "factory", "independent", "painting", "plumbing", "electrical",
      "construction", "renovation", "cctv", "solar", "borewell", "this", "next",
      "today", "asap", "immediately", "critical", "site", "work", "starting",
      "tomorrow", "estimation", "quotation", "proposal", "future", "civil",
      "designer", "supervisor", "engineer", "security", "network", "hvac",
      "fire", "safety", "and", "with", "to", "lakh", "lakhs", "crore", "crores", "cr"
  ]);

  const resultWords = [];
  for (const word of words) {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      
      // Break on empty, stop-word, or floor/digit designations
      if (!cleanWord || stopWords.has(cleanWord) || /^[gG]\+\d+/.test(cleanWord) || /^\d+/.test(cleanWord)) {
          break;
      }
      
      resultWords.push(word.replace(/[,.]$/, ""));
  }

  return resultWords.join(" ").trim();
}

module.exports = extractLocation;
