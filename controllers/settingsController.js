const SettingsModel = require("../models/settingsModel");
const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");

// Default values returned when table is empty
const DEFAULTS = {
  platform_name: "Product Sphere",
  contact_email: "support@productsphere.com",
  commission_percent: "5",
  max_negotiation_rounds: "3",
  maintenance_mode: "false",
  allow_buyer_registration: "true",
  allow_wholesaler_registration: "true",
};

// GET /settings  — Admin only
const getSystemSettings = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
    }

    const stored = await SettingsModel.getSettings();
    // Merge stored values over defaults so all keys are always present
    const merged = { ...DEFAULTS, ...stored };
    return res.status(200).json({ success: true, data: merged });
  } catch (err) {
    console.error("getSystemSettings error:", err);
    return res.status(500).json({ success: false, message: "Server error retrieving settings" });
  }
};

// POST /settings  — Admin only
const updateSystemSettings = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
    }

    const updates = req.body;
    if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
      return res.status(400).json({ success: false, message: "Request body must be a settings object" });
    }

    await SettingsModel.upsertSettings(updates);
    console.log("⚙️  System settings updated by admin:", Object.keys(updates).join(", "));
    return res.status(200).json({ success: true, message: "Settings saved successfully." });
  } catch (err) {
    console.error("updateSystemSettings error:", err);
    return res.status(500).json({ success: false, message: "Server error saving settings" });
  }
};

// PUT /settings/profile  — Any authenticated user
const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, phone, gender, current_password, new_password } = req.body;

  try {
    // Update name / phone / gender if provided
    if (name || phone || gender) {
      await UserModel.updateUserProfile(userId, { name, phone, gender });
    }

    // Handle password change
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ success: false, message: "Current password is required to set a new password." });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      const match = await bcrypt.compare(current_password, user.password);
      if (!match) {
        return res.status(401).json({ success: false, message: "Current password is incorrect." });
      }

      if (new_password.length < 6) {
        return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
      }

      const hashed = await bcrypt.hash(new_password, 10);
      await UserModel.updateUserPassword(userId, hashed);
    }

    // Return updated user (without password)
    const updated = await UserModel.findById(userId);
    if (updated) delete updated.password;

    console.log(`👤 Profile updated for user #${userId}`);
    return res.status(200).json({ success: true, message: "Profile updated successfully.", user: updated });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error updating profile" });
  }
};

const getPublicSettings = async (req, res) => {
  try {
    const stored = await SettingsModel.getSettings();
    const merged = { ...DEFAULTS, ...stored };
    
    return res.status(200).json({
      success: true,
      data: {
        platform_name: merged.platform_name,
        maintenance_mode: merged.maintenance_mode,
        allow_buyer_registration: merged.allow_buyer_registration,
        allow_wholesaler_registration: merged.allow_wholesaler_registration,
        max_negotiation_rounds: merged.max_negotiation_rounds,
        commission_percent: merged.commission_percent,
      }
    });
  } catch (err) {
    console.error("getPublicSettings error:", err);
    return res.status(500).json({ success: false, message: "Server error retrieving settings" });
  }
};

module.exports = { getSystemSettings, updateSystemSettings, updateProfile, getPublicSettings };