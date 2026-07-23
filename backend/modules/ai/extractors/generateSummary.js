/**
 * Generates a clean, professional summary of the work request based on the extracted fields.
 * Do NOT return the original paragraph.
 * 
 * @param {string} text - The original conversation text.
 * @param {Object} extracted - The extracted fields.
 * @returns {string} The generated summary text.
 */
function generateSummary(text, extracted) {
  if (!text) return "";
  
  const lines = [];
  
  // Line 1: [Building/Project Type] [Subject] requested.
  let bType = extracted.buildingType || "";
  const subj = extracted.subject || "";
  
  if (bType) {
      bType = bType.charAt(0).toUpperCase() + bType.slice(1).toLowerCase();
  } else if (extracted.projectType && extracted.projectType !== "Other") {
      bType = extracted.projectType;
  }
  
  let subjStr = "";
  if (subj && subj !== "General Work Request") {
      subjStr = subj.replace(/\s*(?:Request|Project|Work|Installation|Design)$/i, "").toLowerCase();
  }
  
  if (bType && subjStr) {
      lines.push(`${bType} ${subjStr} requested.`);
  } else if (bType) {
      lines.push(`${bType} work requested.`);
  } else if (subjStr) {
      subjStr = subjStr.charAt(0).toUpperCase() + subjStr.slice(1);
      lines.push(`${subjStr} requested.`);
  }
  
  // Line 2: Estimated budget [Budget].
  if (extracted.estimatedBudget) {
      lines.push(`Estimated budget ${extracted.estimatedBudget}.`);
  }
  
  // Line 3: Search for visit/scheduling sentence in original text
  const sentences = text.split(/[.\n]+/);
  let visitLine = "";
  for (let s of sentences) {
      s = s.trim();
      if (/visit|schedule|meet|discussion|ready|tomorrow|friday|monday|tuesday|wednesday|thursday|saturday|sunday/i.test(s)) {
          let cleanS = s.replace(/\brequired\b/gi, "requested");
          cleanS = cleanS.charAt(0).toUpperCase() + cleanS.slice(1);
          if (!cleanS.endsWith(".")) {
              cleanS += ".";
          }
          visitLine = cleanS;
          break;
      }
  }
  if (visitLine) {
      lines.push(visitLine);
  }
  
  if (lines.length === 0) {
      return text;
  }
  
  return lines.join("\n");
}

module.exports = generateSummary;
