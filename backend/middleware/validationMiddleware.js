// Request validation middleware helper
const validateRequest = (schema) => (req, res, next) => {
  // Stub for schema-based validation (e.g. Joi or Zod)
  next();
};

module.exports = { validateRequest };
