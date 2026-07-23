const { parse } = require("../parsers/parser");

/**
 * Analyzes conversation messages and returns an AI extraction object.
 * Integrates the new modular parser and maintains 100% backward compatibility.
 * 
 * @param {Array} messages - The array of message objects.
 * @returns {Promise<Object>} The unified and backward-compatible AI analysis object.
 */
exports.analyzeConversation = async (messages) => {
  const ai = await parse(messages);

  return {
    // New fields
    ...ai,

    // Backward compatibility mappings
    budget: ai.estimatedBudget,
    service: ai.subject,
    preferredEngineer: ai.suggestedEngineer,
    extractedFields: {
      budget: ai.estimatedBudget,
      projectType: ai.projectType,
      priority: ai.priority,
      subject: ai.subject,
      floors: ai.floors,
      buildingType: ai.buildingType,
      location: ai.location,
      suggestedEngineer: ai.suggestedEngineer
    }
  };
};