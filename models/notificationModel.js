const db = require("../config/db");

let tableEnsured = false;

const ensureNotificationTable = async () => {
  if (tableEnsured) return;
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`notifications\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`user_id\` int NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`message\` text NOT NULL,
        \`type\` varchar(50) DEFAULT 'system' COMMENT 'order, bid, verification, system',
        \`is_read\` tinyint(1) DEFAULT 0,
        \`sender_name\` varchar(255) DEFAULT 'System',
        \`sender_role\` varchar(50) DEFAULT 'system',
        \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`user_id\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    // Check if table is empty. If so, seed initial notifications based on existing data
    const [countRows] = await db.query("SELECT COUNT(*) as count FROM notifications");
    if (countRows && countRows[0] && countRows[0].count === 0) {
      // Seed welcome notification for users
      const [users] = await db.query("SELECT id, name, role FROM users");
      for (const u of users) {
        await db.query(
          "INSERT INTO notifications (user_id, title, message, type, is_read, sender_name, sender_role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
          [
            u.id,
            "Welcome to ProductSphere!",
            `Welcome ${u.name}! Your ${u.role} account is active and ready for wholesale trading.`,
            "system",
            0,
            "System Admin",
            "admin"
          ]
        );
      }

      // Seed order notifications from existing orders
      try {
        const [orders] = await db.query("SELECT id, buyer_id, buyer_name, total_amount, status, created_at FROM orders");
        for (const ord of orders) {
          await db.query(
            "INSERT INTO notifications (user_id, title, message, type, is_read, sender_name, sender_role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
              ord.buyer_id,
              `Order #${ord.id} Confirmed`,
              `Your order #${ord.id} for Rs ${ord.total_amount} is currently ${ord.status}.`,
              "order",
              0,
              "System",
              "system",
              ord.created_at || new Date()
            ]
          );
        }
      } catch (_) {}

      // Seed negotiation notifications from existing negotiations
      try {
        const [negotiations] = await db.query("SELECT id, buyer_id, buyer_name, product_name, bid_price, wholesaler_id, status, created_at FROM negotiations");
        for (const neg of negotiations) {
          await db.query(
            "INSERT INTO notifications (user_id, title, message, type, is_read, sender_name, sender_role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
              neg.wholesaler_id,
              `Price Offer for ${neg.product_name}`,
              `Buyer ${neg.buyer_name} submitted a price offer of Rs ${neg.bid_price} on ${neg.product_name}.`,
              "bid",
              0,
              neg.buyer_name,
              "buyer",
              neg.created_at || new Date()
            ]
          );
        }
      } catch (_) {}
    }

    tableEnsured = true;
  } catch (err) {
    console.error("ensureNotificationTable error:", err);
  }
};

// Create a new notification
const createNotification = async ({ userId, title, message, type = 'system', senderName = 'System', senderRole = 'system' }) => {
  try {
    await ensureNotificationTable();
    const [result] = await db.query(
      "INSERT INTO notifications (user_id, title, message, type, is_read, sender_name, sender_role) VALUES (?, ?, ?, ?, 0, ?, ?)",
      [userId, title, message, type, senderName, senderRole]
    );
    return result.insertId;
  } catch (err) {
    console.error("createNotification error:", err);
    return null;
  }
};

// Get notifications for a specific user
const getNotificationsByUser = async (userId) => {
  await ensureNotificationTable();
  const [rows] = await db.query(
    "SELECT id, user_id, title, message, type, is_read, sender_name, sender_role, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC",
    [userId]
  );
  return rows;
};

// Get all notifications for admin audit log
const getAllNotifications = async () => {
  await ensureNotificationTable();
  const [rows] = await db.query(
    `SELECT n.id, n.user_id, n.title, n.message, n.type, n.is_read, n.sender_name, n.sender_role, n.created_at, u.name as recipient_name, u.role as recipient_role 
     FROM notifications n 
     LEFT JOIN users u ON n.user_id = u.id 
     ORDER BY n.created_at DESC, n.id DESC`
  );
  return rows;
};

// Mark a single notification as read
const markAsRead = async (id, userId) => {
  await ensureNotificationTable();
  const [result] = await db.query(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return result.affectedRows > 0;
};

module.exports = {
  ensureNotificationTable,
  createNotification,
  getNotificationsByUser,
  getAllNotifications,
  markAsRead
};