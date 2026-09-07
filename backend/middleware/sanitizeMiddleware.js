/**
 * Clean & sanitize request parameters and body to prevent NoSQL injection.
 * Strips any object keys starting with '$' or containing '.'
 */
const sanitize = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item));
  }

  const clean = {};
  for (const key of Object.keys(obj)) {
    // Strip forbidden NoSQL operator keys
    if (key.startsWith("$") || key.includes(".")) {
      console.warn(`[Sanitize] Blocked suspicious NoSQL operator key: ${key}`);
      continue;
    }
    clean[key] = sanitize(obj[key]);
  }
  return clean;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
};

module.exports = { sanitizeInput };
