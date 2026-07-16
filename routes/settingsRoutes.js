const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getSystemSettings, updateSystemSettings, updateProfile, getPublicSettings } = require("../controllers/settingsController");

// Public platform settings (accessible before login)
router.get("/public", getPublicSettings);

// Platform-wide settings — admin only
router.get("/", authMiddleware, getSystemSettings);
router.post("/", authMiddleware, updateSystemSettings);

// Profile update — any authenticated user
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;