const WhatsAppConversation = require("../models/Conversation");
const User = require("../../users/models/User");
const { normalizePhoneNumber } = require("../utils/whatsappUtils");

/**
 * Find or create a WhatsAppConversation record and auto-link User model if available
 * @param {string} rawPhone - Incoming phone number from Meta
 * @param {string} customerName - Profile name from Meta
 * @returns {Promise<Object>} Conversation document
 */
const findOrCreateConversation = async (rawPhone, customerName) => {
  const cleanPhone = normalizePhoneNumber(rawPhone);
  const convId = `conv_${cleanPhone}`;

  let conversation = await WhatsAppConversation.findOne({
    $or: [
      { conversationId: convId },
      { phoneNumber: cleanPhone },
      { phoneNumber: rawPhone }
    ]
  });

  // Find linked user in portal by matching phone number
  let linkedUserId = null;
  if (cleanPhone) {
    const matchedUser = await User.findOne({
      phone: { $regex: cleanPhone, $options: "i" }
    });
    if (matchedUser) {
      linkedUserId = matchedUser._id;
    }
  }

  if (!conversation) {
    conversation = await WhatsAppConversation.create({
      conversationId: convId,
      phoneNumber: cleanPhone || rawPhone,
      customerName: customerName || "Unknown Customer",
      user: linkedUserId,
      status: "open",
      unreadCount: 0,
      lastMessage: "",
      lastMessageAt: new Date()
    });
  } else {
    // If conversation exists but user was not linked previously, link now if available
    let needsSave = false;
    if (!conversation.user && linkedUserId) {
      conversation.user = linkedUserId;
      needsSave = true;
    }
    if (customerName && customerName !== "Unknown Customer" && conversation.customerName !== customerName) {
      conversation.customerName = customerName;
      needsSave = true;
    }
    if (needsSave) {
      await conversation.save();
    }
  }

  return conversation;
};

module.exports = {
  findOrCreateConversation
};
