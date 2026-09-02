const cloudinary = require("../../../config/cloudinary");
const { getWhatsAppConfig, normalizePhoneNumber } = require("../utils/whatsappUtils");

/**
 * Fetch media binary from Meta WhatsApp API and persist permanently to Cloudinary
 * @param {string} metaMediaId - Meta media ID
 * @param {string} [fallbackType="image"] - Fallback media type
 * @param {string} [originalFileName=""] - Original filename if known
 * @returns {Promise<Object>} { url, mimeType, fileSize, fileName }
 */
const fetchAndStoreMetaMedia = async (metaMediaId, fallbackType = "image", originalFileName = "") => {
  if (!metaMediaId || metaMediaId.startsWith("http://") || metaMediaId.startsWith("https://")) {
    return { url: metaMediaId || "", mimeType: "", fileSize: 0, fileName: originalFileName };
  }

  const { token, apiVersion } = getWhatsAppConfig();
  if (!token || token === "your_meta_whatsapp_access_token") {
    console.warn("[MetaMedia] No valid Meta token to download media:", metaMediaId);
    return { url: "", mimeType: "", fileSize: 0, fileName: originalFileName };
  }

  try {
    // Step 1: Query Meta Graph API for the media download URL
    const metaInfoUrl = `https://graph.facebook.com/${apiVersion}/${metaMediaId}`;
    const infoRes = await fetch(metaInfoUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!infoRes.ok) {
      const errData = await infoRes.json();
      console.error("[MetaMedia] Failed to get media metadata from Meta:", errData);
      return { url: "", mimeType: "", fileSize: 0, fileName: originalFileName };
    }

    const metaInfo = await infoRes.json();
    const downloadUrl = metaInfo.url;
    const mimeType = metaInfo.mime_type || "";
    const fileSize = metaInfo.file_size || 0;

    if (!downloadUrl) {
      console.error("[MetaMedia] No download URL provided by Meta for media ID:", metaMediaId);
      return { url: "", mimeType, fileSize, fileName: originalFileName };
    }

    // Step 2: Download binary data from Meta download URL with Bearer token
    const fileRes = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!fileRes.ok) {
      console.error("[MetaMedia] Failed to download media binary from Meta URL:", fileRes.status);
      return { url: "", mimeType, fileSize, fileName: originalFileName };
    }

    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 3: Stream upload buffer to Cloudinary
    const cloudinaryResult = await new Promise((resolve, reject) => {
      let resourceType = "auto";
      if (mimeType.startsWith("video/")) resourceType = "video";
      else if (mimeType.startsWith("image/")) resourceType = "image";
      else if (mimeType.startsWith("audio/")) resourceType = "video"; // Cloudinary treats audio as video resource type
      else resourceType = "raw";

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "work-portal/whatsapp-media",
          resource_type: resourceType,
          public_id: `wa_${metaMediaId}_${Date.now()}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    const secureUrl = cloudinaryResult.secure_url || cloudinaryResult.url;
    console.log(`✅ [MetaMedia] Successfully saved WhatsApp media to Cloudinary: ${secureUrl}`);

    return {
      url: secureUrl,
      mimeType: mimeType || cloudinaryResult.format,
      fileSize: fileSize || cloudinaryResult.bytes,
      fileName: originalFileName || `${metaMediaId}.${cloudinaryResult.format || "bin"}`
    };
  } catch (err) {
    console.error("[MetaMedia] Error fetching and uploading media:", err);
    return { url: "", mimeType: "", fileSize: 0, fileName: originalFileName };
  }
};

/**
 * Call Meta Cloud API to send a text message
 * @param {string} to - Destination phone number
 * @param {string} text - Message body
 * @returns {Promise<Object>} { metaMessageId, metaResponseData }
 */
const sendMetaTextMessage = async (to, text) => {
  const { token, phoneNumberId, apiVersion } = getWhatsAppConfig();
  const cleanTo = normalizePhoneNumber(to);

  if (!cleanTo) {
    throw new Error("Recipient phone number is required");
  }
  if (!text) {
    throw new Error("Message text is required");
  }

  if (token && phoneNumberId && token !== "your_meta_whatsapp_access_token") {
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanTo,
        type: "text",
        text: {
          preview_url: false,
          body: text
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Meta WhatsApp Cloud API error response:", data);
      throw new Error(data.error ? data.error.message : "Failed to send WhatsApp message via Meta API");
    }

    return {
      metaMessageId: data.messages && data.messages[0] ? data.messages[0].id : "",
      metaResponseData: data
    };
  } else {
    console.log("[MetaApiService] Simulation mode enabled: Credentials not fully configured. Target:", cleanTo);
    const metaMessageId = `sim_${Date.now()}`;
    return {
      metaMessageId,
      metaResponseData: { simulated: true, message: "Simulated send", metaMessageId }
    };
  }
};

/**
 * Call Meta Cloud API to send a media message (Image, Video, Audio, Document)
 * @param {string} to - Destination phone number
 * @param {string} mediaUrl - Public HTTPS media URL (Cloudinary)
 * @param {string} [mediaType="image"] - "image" | "video" | "audio" | "document"
 * @param {string} [caption=""] - Optional caption text
 * @param {string} [fileName=""] - Optional document file name
 * @returns {Promise<Object>} { metaMessageId, metaResponseData }
 */
const sendMetaMediaMessage = async (to, mediaUrl, mediaType = "image", caption = "", fileName = "") => {
  const { token, phoneNumberId, apiVersion } = getWhatsAppConfig();
  const cleanTo = normalizePhoneNumber(to);

  if (!cleanTo) {
    throw new Error("Recipient phone number is required");
  }
  if (!mediaUrl) {
    throw new Error("Media URL is required");
  }

  const validTypes = ["image", "video", "audio", "document"];
  const finalType = validTypes.includes(mediaType.toLowerCase()) ? mediaType.toLowerCase() : "image";

  if (token && phoneNumberId && token !== "your_meta_whatsapp_access_token") {
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    const mediaPayload = {
      link: mediaUrl
    };

    if (caption && ["image", "video", "document"].includes(finalType)) {
      mediaPayload.caption = caption;
    }

    if (fileName && finalType === "document") {
      mediaPayload.filename = fileName;
    }

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: cleanTo,
      type: finalType,
      [finalType]: mediaPayload
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Meta WhatsApp Cloud API media error response:", data);
      throw new Error(data.error ? data.error.message : "Failed to send WhatsApp media message via Meta API");
    }

    return {
      metaMessageId: data.messages && data.messages[0] ? data.messages[0].id : "",
      metaResponseData: data
    };
  } else {
    const metaMessageId = `sim_media_${Date.now()}`;
    return {
      metaMessageId,
      metaResponseData: { simulated: true, message: "Simulated media send", metaMessageId }
    };
  }
};

/**
 * Call Meta Cloud API to send a template message
 * @param {string} to - Destination phone number
 * @param {string} templateName - Template name
 * @param {string} [languageCode="en_US"] - Language code
 * @param {Array} [components=[]] - Dynamic parameters
 * @returns {Promise<Object>} Meta API response
 */
const sendMetaTemplateMessage = async (to, templateName, languageCode = "en_US", components = []) => {
  const { token, phoneNumberId, apiVersion } = getWhatsAppConfig();
  const cleanTo = normalizePhoneNumber(to);

  if (!cleanTo || !templateName) {
    throw new Error("Recipient phone number and template name are required");
  }

  if (token && phoneNumberId && token !== "your_meta_whatsapp_access_token") {
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanTo,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: components
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ? data.error.message : "Failed to send template message via Meta API");
    }
    return data;
  } else {
    return { simulated: true, templateName, to: cleanTo };
  }
};

module.exports = {
  fetchAndStoreMetaMedia,
  sendMetaTextMessage,
  sendMetaMediaMessage,
  sendMetaTemplateMessage
};
