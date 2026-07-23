const WhatsappMessage = require("../models/Message");
const { normalizePhoneNumber } = require("../utils/whatsappUtils");
const { findOrCreateConversation } = require("./conversationService");
const { sendMetaTextMessage, sendMetaTemplateMessage } = require("./metaApiService");
const { emitWhatsAppEvents } = require("../socket/socketEvents");

/**
 * Send an outgoing text message using Meta WhatsApp Cloud API and persist to MongoDB
 * @param {string} to - Destination phone number
 * @param {string} text - Message content
 * @param {Object} [io] - Socket.io instance for real-time updates
 * @param {string} [senderUserId] - Optional User._id of sender agent
 * @returns {Promise<Object>} API response and created DB message
 */
const sendTextMessage = async (to, text, io = null, senderUserId = null) => {
  const cleanTo = normalizePhoneNumber(to);
  
  // Call API
  const { metaMessageId, metaResponseData } = await sendMetaTextMessage(cleanTo, text);

  // Find or create parent conversation
  const conversation = await findOrCreateConversation(cleanTo, "Customer");

  // Save outgoing message to DB
  const createdMessage = await WhatsappMessage.create({
    conversationId: conversation.conversationId,
    conversation: conversation._id,
    metaMessageId: metaMessageId,
    sender: senderUserId || null,
    phoneNumber: cleanTo,
    customerName: conversation.customerName || "Customer",
    direction: "outgoing",
    messageType: "text",
    text: text,
    status: "sent"
  });

  // Update Conversation pointers
  conversation.lastMessage = text;
  conversation.lastMessageAt = new Date();
  conversation.lastMessageId = createdMessage._id;
  await conversation.save();

  // Emit Socket Events for real-time frontend update
  emitWhatsAppEvents(io, createdMessage, conversation);

  return {
    meta: metaResponseData,
    message: createdMessage,
    conversation: conversation
  };
};

/**
 * Send template message wrapper delegating to metaApiService
 */
const sendTemplateMessage = async (to, templateName, languageCode = "en_US", components = []) => {
  return sendMetaTemplateMessage(to, templateName, languageCode, components);
};

module.exports = {
  sendTextMessage,
  sendTemplateMessage
};
