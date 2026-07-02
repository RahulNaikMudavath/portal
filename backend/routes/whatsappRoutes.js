const express = require("express");

const router = express.Router();

const {
  receiveMessage,
  getConversations,
} = require("../controllers/whatsappController");

router.post("/receive", receiveMessage);

router.get("/conversations", getConversations);

module.exports = router;