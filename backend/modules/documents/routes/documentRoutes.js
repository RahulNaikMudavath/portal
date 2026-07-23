const express = require("express");
const router = express.Router();
const { protect } = require("../../../middleware/authMiddleware");
const upload = require("../../../middleware/uploadMiddleware");

const {
  uploadDocument,
  getDocuments,
  togglePin,
  uploadNewVersion,
  deleteDocument
} = require("../controllers/documentController");

router.post("/", protect, upload.single("file"), uploadDocument);
router.get("/", protect, getDocuments);
router.put("/:id/pin", protect, togglePin);
router.put("/:id/version", protect, upload.single("file"), uploadNewVersion);
router.delete("/:id", protect, deleteDocument);

module.exports = router;
