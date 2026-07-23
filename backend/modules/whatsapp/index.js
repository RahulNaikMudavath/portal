const whatsappRoutes = require("./routes/whatsappRoutes");
const whatsappController = require("./controllers/whatsappController");
const metaApiService = require("./services/metaApiService");
const conversationService = require("./services/conversationService");
const messageService = require("./services/messageService");
const mediaService = require("./services/mediaService");
const webhookHandler = require("./webhooks/webhookHandler");
const whatsappValidator = require("./validators/whatsappValidator");
const whatsappUtils = require("./utils/whatsappUtils");
const socketEvents = require("./socket/socketEvents");
const WhatsAppConversation = require("./models/Conversation");
const WhatsAppMessage = require("./models/Message");
const whatsappPrompts = require("./prompts");
const whatsappConstants = require("./constants");

module.exports = {
  routes: whatsappRoutes,
  controllers: whatsappController,
  services: {
    metaApi: metaApiService,
    conversation: conversationService,
    message: messageService,
    media: mediaService
  },
  webhooks: webhookHandler,
  validators: whatsappValidator,
  utils: whatsappUtils,
  socket: socketEvents,
  prompts: whatsappPrompts,
  constants: whatsappConstants,
  models: {
    WhatsAppConversation,
    WhatsAppMessage
  }
};
