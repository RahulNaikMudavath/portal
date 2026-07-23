const express = require("express");
const router = express.Router();

const { signup, login, googleLogin, completeProfile } = require("../controllers/authController");
const { protect } = require("../../../middleware/authMiddleware");
const upload = require("../../../middleware/uploadMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.put("/complete-profile", protect, upload.single("photo"), completeProfile);

module.exports = router;