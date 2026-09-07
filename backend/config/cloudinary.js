const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dinvp6fi9",
  api_key: process.env.CLOUDINARY_API_KEY || "524465222612239",
  api_secret: process.env.CLOUDINARY_API_SECRET || "ZpKWjI92r58zbekjsBBqliiB5MQ"
});

module.exports = cloudinary;