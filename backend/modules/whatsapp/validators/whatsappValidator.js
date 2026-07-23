/**
 * Validate query parameters for Meta Webhook verification
 * @param {Object} query - req.query
 * @returns {Object} { isValid, mode, token, challenge, error }
 */
const validateWebhookVerifyQuery = (query) => {
  const mode = query["hub.mode"];
  const token = query["hub.verify_token"];
  const challenge = query["hub.challenge"];

  if (!mode || !token) {
    return { isValid: false, error: "Missing hub.mode or hub.verify_token query parameters" };
  }

  return { isValid: true, mode, token, challenge };
};

/**
 * Validate request body for outgoing text messages
 * @param {Object} body - req.body
 * @returns {Object} { isValid, recipient, text, error }
 */
const validateSendMessagePayload = (body) => {
  const { to, phoneNumber, text } = body || {};
  const recipient = to || phoneNumber;

  if (!recipient) {
    return { isValid: false, error: "Recipient phone number ('to' or 'phoneNumber') is required" };
  }

  if (!text || typeof text !== "string" || !text.trim()) {
    return { isValid: false, error: "Message 'text' is required and must not be empty" };
  }

  return { isValid: true, recipient: recipient.trim(), text: text.trim() };
};

module.exports = {
  validateWebhookVerifyQuery,
  validateSendMessagePayload
};
