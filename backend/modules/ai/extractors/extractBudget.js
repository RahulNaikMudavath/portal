/**
 * Extracts the estimated budget from the provided text.
 * Returns only actual budgets (e.g. ₹25 Lakhs, 4 Crores, 15 Lakhs, ₹2.5 Cr) and never floor counts.
 * 
 * @param {string} text - The input text.
 * @returns {string} The extracted budget string, or "" if not found.
 */
function extractBudget(text) {
    if (!text) return "";
    
    // Pattern to match numbers followed by Lakhs/Crores/Cr, with optional ₹, Rs, INR prefix
    // Group 1: ₹ (if present)
    // Group 2: Decimal or integer number
    // Group 3: Lakhs/Crores/Cr unit
    const budgetRegex = /(?:(₹)|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(lakhs?|crores?|cr)\b/i;
    const match = text.match(budgetRegex);
    if (match) {
        const hasRupee = !!match[1];
        const number = match[2];
        let unit = match[3].toLowerCase();
        
        if (unit.startsWith("lakh")) {
            unit = "Lakhs";
        } else if (unit.startsWith("crore")) {
            unit = "Crores";
        } else if (unit.startsWith("cr")) {
            unit = "Cr";
        }
        
        return (hasRupee ? "₹" : "") + number + " " + unit;
    }
    
    return "";
}

module.exports = extractBudget;
