const jwt = require("jsonwebtoken");
const db = require("../config/db");
const JWT_SECRET = "serve_ease";

module.exports = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user exists and status is active in database
    const [rows] = await db.query(
      "SELECT id, email, role, status FROM users WHERE id = ?",
      [decoded.id]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: "User account no longer exists." });
    }

    const user = rows[0];
    const userStatus = (user.status || 'approved').toLowerCase();

    if (userStatus === 'suspended' || userStatus === 'revoked') {
      return res.status(403).json({
        success: false,
        message: "Your access has been revoked by the administrator."
      });
    }

    if (userStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        message: "Your registration was rejected by the administrator."
      });
    }

    if (user.role === 'wholesaler' && userStatus === 'pending') {
      return res.status(403).json({
        success: false,
        message: "Your business account is pending approval."
      });
    }

    req.user = {
      ...decoded,
      status: user.status
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};
