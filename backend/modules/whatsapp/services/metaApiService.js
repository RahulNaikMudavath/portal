const { getWhatsAppConfig, normalizePhoneNumber } = require("../utils/whatsappUtils");

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
  sendMetaTextMessage,
  sendMetaTemplateMessage
};
