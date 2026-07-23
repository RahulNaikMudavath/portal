/**
 * Extracts the building type from the text using keyword matching.
 * E.g., Luxury Villa, Villa, Apartment, Commercial Office, Warehouse, Hospital, School, Restaurant, Hotel, Factory, Independent House, Duplex House.
 * 
 * @param {string} text - The input text.
 * @returns {string} The matched building type (capitalized), or "" if not found.
 */
function extractBuildingType(text) {
  if (!text) return "";

  if (/\bluxury\s*villa\b/i.test(text) || (/\bluxury\b/i.test(text) && /\bvilla\b/i.test(text))) {
      return "Luxury Villa";
  }
  if (/\bvilla\b/i.test(text)) {
      return "Villa";
  }
  if (/\bapartment\b|\bflat\b/i.test(text)) {
      return "Apartment";
  }
  if (/\boffice\b/i.test(text)) {
      return "Commercial Office";
  }
  if (/\bwarehouse\b/i.test(text)) {
      return "Warehouse";
  }
  if (/\bhospital\b/i.test(text)) {
      return "Hospital";
  }
  if (/\bschool\b/i.test(text)) {
      return "School";
  }
  if (/\brestaurant\b/i.test(text)) {
      return "Restaurant";
  }
  if (/\bhotel\b/i.test(text)) {
      return "Hotel";
  }
  if (/\bfactory\b/i.test(text)) {
      return "Factory";
  }
  if (/\bduplex\b/i.test(text)) {
      return "Duplex House";
  }
  if (/\bindependent\s*house\b/i.test(text) || /\bhouse\b/i.test(text)) {
      return "Independent House";
  }

  return "";
}

module.exports = extractBuildingType;
