const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const mime = (file.mimetype || "").toLowerCase();
    const originalName = file.originalname || "attachment";

    let resource_type = "raw";
    if (mime.startsWith("image/")) {
      resource_type = "image";
    } else if (mime.startsWith("video/") || mime.startsWith("audio/")) {
      resource_type = "video";
    }

    const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniquePublicId = `${Date.now()}_${cleanName}`;

    return {
      folder: "work-portal",
      resource_type: resource_type,
      public_id: resource_type === "raw" ? uniquePublicId : undefined
    };
  }
});


const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
  // Audio
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/webm",
  "audio/mp4",
  "audio/x-m4a",
  // Video
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo"
]);

const fileFilter = (req, file, cb) => {
  const isAllowedMime = ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase());
  const isDangerousExt = /\.(exe|bat|cmd|sh|php|pl|cgi|jar|js|vbs|scr|hta|pif|msi)$/i.test(file.originalname);

  if (!isAllowedMime || isDangerousExt) {
    return cb(new Error(`File type '${file.mimetype}' is not permitted for upload`), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max size
    files: 10
  },
  fileFilter
});

module.exports = upload;