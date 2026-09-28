const NotificationModel = require("../models/notificationModel");
const UserModel = require("../models/userModel");

// Get notifications for current logged in user (Buyer or Wholesaler)
const getUserNotifications = async (req, res) => {
  try {
    const user = await UserModel.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const notifications = await NotificationModel.getNotificationsByUser(user.id);
    return res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (err) {
    console.error("getUserNotifications error:", err);
    return res.status(500).json({ success: false, message: "Server error retrieving notifications." });
  }
};

// Mark notification as read
const markNotificationRead = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: "Notification ID is required." });
  }

  try {
    const user = await UserModel.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const updated = await NotificationModel.markAsRead(id, user.id);
    return res.status(200).json({
      success: true,
      message: "Notification marked as read."
    });
  } catch (err) {
    console.error("markNotificationRead error:", err);
    return res.status(500).json({ success: false, message: "Server error updating notification." });
  }
};

// Get all notifications audit log for Admin
const getAdminNotifications = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
    }

    const notifications = await NotificationModel.getAllNotifications();
    return res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (err) {
    console.error("getAdminNotifications error:", err);
    return res.status(500).json({ success: false, message: "Server error retrieving notification audit log." });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationRead,
  getAdminNotifications
};