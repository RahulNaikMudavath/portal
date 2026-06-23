const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log("🔥 NEW MIDDLEWARE RUNNING");
    
    return {
      folder: "work-portal",
      resource_type: "auto"
    };
  }
});

const upload = multer({ storage });

module.exports = upload;