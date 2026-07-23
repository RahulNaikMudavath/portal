/**
 * Service to calculate distance and coordinate metrics for field engineers
 */

/**
 * Calculate distance between two coordinate sets
 * @param {Object} loc1 {lat, lng}
 * @param {Object} loc2 {lat, lng}
 * @returns {Number} Distance in KM
 */
const calculateDistance = (loc1, loc2) => {
  // Stub for haversine or distance matrix lookup
  return 0.0;
};

module.exports = {
  calculateDistance
};
