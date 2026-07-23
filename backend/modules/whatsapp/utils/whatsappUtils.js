/**
 * Service configuration helper for WhatsApp Cloud API
 */
const getWhatsAppConfig = () => {
  return {
    token: process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || "admin_portal_whatsapp_token",
    apiVersion: process.env.GRAPH_API_VERSION || process.env.WHATSAPP_API_VERSION || "v21.0"
  };
};

/**
 * Clean phone number helper to extract numeric digits only
 * @param {string} phone
 * @returns {string}
 */
const normalizePhoneNumber = (phone) => {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
};

/**
 * Extract media payload details based on Meta message type
 * @param {Object} msg - Raw Meta message object
 * @returns {Object} { messageType, text, media, mediaUrl, fileName }
 */
const parseMessageContent = (msg) => {
  const type = msg.type || "text";
  let messageType = "text";
  let text = "";
  let mediaUrl = "";
  let fileName = "";
  const mediaObj = {
    url: "",
    metaMediaId: "",
    mimeType: "",
    fileName: "",
    fileSize: 0,
    thumbnailUrl: "",
    durationSeconds: 0
  };

  switch (type) {
    case "text":
      messageType = "text";
      text = msg.text ? msg.text.body : "";
      break;

    case "image":
      messageType = "image";
      text = (msg.image && msg.image.caption) ? msg.image.caption : "[Image]";
      mediaObj.metaMediaId = msg.image ? msg.image.id || "" : "";
      mediaObj.mimeType = msg.image ? msg.image.mime_type || "image/jpeg" : "image/jpeg";
      mediaObj.url = mediaObj.metaMediaId;
      mediaUrl = mediaObj.metaMediaId;
      break;

    case "document": {
      const docMime = (msg.document && msg.document.mime_type) ? msg.document.mime_type.toLowerCase() : "";
      const docName = (msg.document && msg.document.filename) ? msg.document.filename : "";
      
      if (docMime.includes("pdf") || docName.toLowerCase().endsWith(".pdf")) {
        messageType = "pdf";
      } else {
        messageType = "document";
      }
      
      text = (msg.document && msg.document.caption) ? msg.document.caption : (docName ? `[Document: ${docName}]` : "[Document]");
      mediaObj.metaMediaId = msg.document ? msg.document.id || "" : "";
      mediaObj.mimeType = docMime || "application/octet-stream";
      mediaObj.fileName = docName;
      mediaObj.url = mediaObj.metaMediaId;
      mediaUrl = mediaObj.metaMediaId;
      fileName = docName;
      break;
    }

    case "video":
      messageType = "video";
      text = (msg.video && msg.video.caption) ? msg.video.caption : "[Video]";
      mediaObj.metaMediaId = msg.video ? msg.video.id || "" : "";
      mediaObj.mimeType = msg.video ? msg.video.mime_type || "video/mp4" : "video/mp4";
      mediaObj.url = mediaObj.metaMediaId;
      mediaUrl = mediaObj.metaMediaId;
      break;

    case "audio":
      messageType = "audio";
      text = "[Audio Message]";
      mediaObj.metaMediaId = msg.audio ? msg.audio.id || "" : "";
      mediaObj.mimeType = msg.audio ? msg.audio.mime_type || "audio/ogg" : "audio/ogg";
      mediaObj.url = mediaObj.metaMediaId;
      mediaUrl = mediaObj.metaMediaId;
      break;

    case "location":
      messageType = "location";
      text = msg.location ? `[Location: Lat ${msg.location.latitude}, Lng ${msg.location.longitude}]` : "[Location]";
      break;

    case "interactive": {
      messageType = "interactive";
      const intType = msg.interactive ? msg.interactive.type : "";
      if (intType === "button_reply" && msg.interactive.button_reply) {
        text = msg.interactive.button_reply.title || "[Button Reply]";
      } else if (intType === "list_reply" && msg.interactive.list_reply) {
        text = msg.interactive.list_reply.title || "[List Selection]";
        fileName = msg.interactive.list_reply.description || "";
      } else {
        text = "[Interactive Message]";
      }
      break;
    }

    case "button":
      messageType = "button";
      text = msg.button ? msg.button.text : "[Button Click]";
      break;

    default:
      messageType = type;
      text = `[${type.toUpperCase()} Message]`;
      break;
  }

  return { messageType, text, media: mediaObj, mediaUrl, fileName };
};

module.exports = {
  getWhatsAppConfig,
  normalizePhoneNumber,
  parseMessageContent
};
