const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getUserNotifications,
  markNotificationRead,
  getAdminNotifications
} = require("../controllers/notificationController");

router.get("/", authMiddleware, getUserNotifications);
router.post("/read", authMiddleware, markNotificationRead);
router.get("/admin", authMiddleware, getAdminNotifications);

module.exports = router;
