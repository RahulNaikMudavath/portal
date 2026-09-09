require("dotenv").config();
const cloudinary = require("cloudinary").v2;

const isInvalid = (str) => {
  if (!str || typeof str !== "string") return true;
  const s = str.trim().toLowerCase();
  return (
    s === "" ||
    s.includes("xxxx") ||
    s.includes("your_") ||
    s.includes("dummy") ||
    s.includes("placeholder") ||
    s === "undefined" ||
    s === "null" ||
    s.length < 4
  );
};

// If a placeholder CLOUDINARY_URL is present, delete it so it won't override valid keys
if (isInvalid(process.env.CLOUDINARY_URL)) {
  delete process.env.CLOUDINARY_URL;
}

const cloud_name = !isInvalid(process.env.CLOUDINARY_CLOUD_NAME)
  ? process.env.CLOUDINARY_CLOUD_NAME.trim()
  : "dinvp6fi9";

const api_key = !isInvalid(process.env.CLOUDINARY_API_KEY)
  ? process.env.CLOUDINARY_API_KEY.trim()
  : "524465222612239";

const api_secret = !isInvalid(process.env.CLOUDINARY_API_SECRET)
  ? process.env.CLOUDINARY_API_SECRET.trim()
  : "ZpKWjI92r58zbekjsBBqliiB5MQ";

// Ensure process.env is updated globally so any nested sub-packages also use valid keys
process.env.CLOUDINARY_CLOUD_NAME = cloud_name;
process.env.CLOUDINARY_API_KEY = api_key;
process.env.CLOUDINARY_API_SECRET = api_secret;

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
  secure: true
});

module.exports = cloudinary;