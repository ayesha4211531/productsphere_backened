const UserModel = require("../models/userModel");

const getPendingWholesalers = async (req, res) => {
  try {
    // Only allow admin role to access this controller
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
    }

    const wholesalers = await UserModel.findPendingWholesalers();
    return res.status(200).json({
      success: true,
      data: wholesalers
    });
  } catch (err) {
    console.error("getPendingWholesalers error:", err);
    return res.status(500).json({ success: false, message: "Server error retrieving pending businesses" });
  }
};

const updateBusinessStatus = async (req, res) => {
  const { userId, status } = req.body;

  if (!userId || !status) {
    return res.status(400).json({ success: false, message: "userId and status are required" });
  }

  // Validate status values
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value. Must be 'approved', 'rejected', or 'pending'." });
  }

  try {
    // Only allow admin role to access this controller
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
    }

    const updated = await UserModel.updateUserStatus(userId, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found or status update failed" });
    }

    console.log(`💼 Business status updated: User #${userId} is now ${status}`);
    return res.status(200).json({
      success: true,
      message: `Business status successfully updated to ${status}.`
    });
  } catch (err) {
    console.error("updateBusinessStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error updating status" });
  }
};

module.exports = {
  getPendingWholesalers,
  updateBusinessStatus
};
