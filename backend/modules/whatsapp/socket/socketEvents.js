/**
 * Emit Socket.io events for WhatsApp real-time updates
 * @param {Object} io - Socket.io instance
 * @param {Object} message - Created / Updated WhatsApp message document
 * @param {Object} conversation - Updated WhatsApp conversation document
 */
const emitWhatsAppEvents = (io, message, conversation) => {
  if (!io) return;
  
  if (message) {
    console.log("🔥 Emitting Socket Event: newMessage");
    io.emit("newMessage", message);
  }

  if (conversation) {
    console.log("🔥 Emitting Socket Event: conversationUpdated");
    io.emit("conversationUpdated", conversation);
  }
};

module.exports = {
  emitWhatsAppEvents
};
