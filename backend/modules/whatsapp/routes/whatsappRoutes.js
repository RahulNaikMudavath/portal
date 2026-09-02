const express = require("express");
const upload = require("../../../middleware/uploadMiddleware");

const router = express.Router();

const {
  getConversations,
  metaVerifyWebhook,
  metaReceiveWebhook,
  sendMessage,
  sendMedia
} = require("../controllers/whatsappController");

// Official Meta WhatsApp Cloud API Webhooks
router.get("/webhook", metaVerifyWebhook);
router.post("/webhook", metaReceiveWebhook);

// Outgoing & Ingestion endpoints
router.post("/send", sendMessage);
router.post("/send-media", upload.single("file"), sendMedia);
router.get("/conversations", getConversations);

module.exports = router;
