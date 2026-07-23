const express = require("express");

const router = express.Router();

const {
  getConversations,
  metaVerifyWebhook,
  metaReceiveWebhook,
  sendMessage
} = require("../controllers/whatsappController");

// Official Meta WhatsApp Cloud API Webhooks
router.get("/webhook", metaVerifyWebhook);
router.post("/webhook", metaReceiveWebhook);

// Outgoing & Ingestion endpoints
router.post("/send", sendMessage);
router.get("/conversations", getConversations);

module.exports = router;
