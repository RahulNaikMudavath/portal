const express = require("express");
const upload = require("../../../middleware/uploadMiddleware");
const { protect } = require("../../../middleware/authMiddleware");
const { isAdmin } = require("../../../middleware/roleMiddleware");

const router = express.Router();

const {
  getConversations,
  metaVerifyWebhook,
  metaReceiveWebhook,
  sendMessage,
  sendMedia
} = require("../controllers/whatsappController");

// Official Meta WhatsApp Cloud API Webhooks (Public for Meta verification and webhook events)
router.get("/webhook", metaVerifyWebhook);
router.post("/webhook", metaReceiveWebhook);

// Outgoing & Ingestion endpoints (Protected - Admins only)
router.post("/send", protect, isAdmin, sendMessage);
router.post("/send-media", protect, isAdmin, upload.single("file"), sendMedia);
router.get("/conversations", protect, isAdmin, getConversations);

module.exports = router;
