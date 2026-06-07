const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "work-portal",
    allowed_formats: ["jpg", "png", "pdf", "mp4"]
  }
});

const upload = multer({ storage });

module.exports = upload;