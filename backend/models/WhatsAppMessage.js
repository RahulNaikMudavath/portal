const mongoose = require("mongoose");

const whatsappMessageSchema = new mongoose.Schema(
{
    conversationId:{
        type:String,
        required:true
    },

    phoneNumber:{
        type:String,
        required:true
    },

    customerName:{
        type:String,
        default:"Unknown Customer"
    },

    direction:{
        type:String,
        enum:["incoming","outgoing"],
        required:true
    },

    messageType:{
        type:String,
        enum:["text","image","document","audio"],
        default:"text"
    },

    text:{
        type:String,
        default:""
    },

    mediaUrl:String,

    fileName:String,

    status:{
        type:String,
        default:"received"
    }

},
{
    timestamps:true
});

module.exports=mongoose.model(
    "WhatsappMessage",
    whatsappMessageSchema
);