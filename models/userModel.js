const db = require("../config/db");

// Find a user by email in the database
const findByEmail = async (email) => {
  const [rows] = await db.query(
    `SELECT id, name, email, password, role, phone, gender, status, license_no, business_address FROM users WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
};

// Create a new user record in the database
const createUser = async ({ name, phone, gender, email, password, role, status, license_no, business_address }) => {
  const finalStatus = status || (role === 'wholesaler' ? 'pending' : 'approved');
  const [result] = await db.query(
    `INSERT INTO users (name, phone, gender, email, password, role, status, license_no, business_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name, 
      phone || null, 
      gender || "male", 
      email, 
      password, 
      role || "buyer", 
      finalStatus, 
      license_no || null, 
      business_address || null
    ]
  );
  return result.insertId;
};

// Find wholesalers with pending verification
const findPendingWholesalers = async () => {
  const [rows] = await db.query(
    `SELECT id, name, email, role, phone, gender, status, license_no, business_address FROM users WHERE role = ? AND status = ?`,
    ['wholesaler', 'pending']
  );
  return rows;
};

// Update user verification status
const updateUserStatus = async (id, status) => {
  const [result] = await db.query(
    `UPDATE users SET status = ? WHERE id = ?`,
    [status, id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  findByEmail,
  createUser,
  findPendingWholesalers,
  updateUserStatus
};
