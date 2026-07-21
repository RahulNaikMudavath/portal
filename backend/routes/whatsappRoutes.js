const express = require("express");

const router = express.Router();

const {
  receiveMessage,
  getConversations,
  metaVerifyWebhook,
  metaReceiveWebhook
} = require("../controllers/whatsappController");

// Official Meta WhatsApp Cloud API Webhooks
router.get("/webhook", metaVerifyWebhook);
router.post("/webhook", metaReceiveWebhook);

router.post("/receive", receiveMessage);
router.get("/conversations", getConversations);

module.exports = router;