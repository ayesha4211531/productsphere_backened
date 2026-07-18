const db = require("../config/db");

// Find a user by email in the database (returns all fields including document images)
const findByEmail = async (email) => {
  const [rows] = await db.query(
    `SELECT id, name, email, password, role, phone, gender, status, license_no, business_address, shop_picture, cnic_front, cnic_back FROM users WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
};

// Create a new user record in the database
const createUser = async ({ name, phone, gender, email, password, role, status, license_no, business_address, shop_picture, cnic_front, cnic_back }) => {
  const finalStatus = status || (role === 'wholesaler' ? 'pending' : 'approved');
  const [result] = await db.query(
    `INSERT INTO users (name, phone, gender, email, password, role, status, license_no, business_address, shop_picture, cnic_front, cnic_back) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      phone || null,
      gender || "male",
      email,
      password,
      role || "buyer",
      finalStatus,
      license_no || null,
      business_address || null,
      shop_picture || null,
      cnic_front || null,
      cnic_back || null
    ]
  );
  return result.insertId;
};

// Find wholesalers with pending verification (includes document images for admin review)
const findPendingWholesalers = async () => {
  const [rows] = await db.query(
    `SELECT id, name, email, role, phone, gender, status, license_no, business_address, shop_picture, cnic_front, cnic_back FROM users WHERE role = ? AND status = ?`,
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

// Find wholesalers that are already verified and approved
const findApprovedWholesalers = async () => {
  const [rows] = await db.query(
    `SELECT id, name, email FROM users WHERE role = ? AND status = ?`,
    ['wholesaler', 'approved']
  );
  return rows;
};

// Find all buyers registered on the platform
const findBuyers = async () => {
  const [rows] = await db.query(
    `SELECT id, name, email, role, phone, gender, status, created_at FROM users WHERE role = ?`,
    ['buyer']
  );
  return rows;
};

// Find a user by ID (for profile updates and password verification)
const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT id, name, email, password, role, phone, gender, status, license_no, business_address FROM users WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

// Update a user's profile fields (name, phone, gender)
const updateUserProfile = async (id, { name, phone, gender }) => {
  const fields = [];
  const values = [];
  if (name !== undefined && name !== null) { fields.push('name = ?'); values.push(name); }
  if (phone !== undefined && phone !== null) { fields.push('phone = ?'); values.push(phone); }
  if (gender !== undefined && gender !== null) { fields.push('gender = ?'); values.push(gender); }
  if (fields.length === 0) return false;
  values.push(id);
  const [result] = await db.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
};

// Update a user's hashed password
const updateUserPassword = async (id, hashedPassword) => {
  const [result] = await db.query(
    `UPDATE users SET password = ? WHERE id = ?`,
    [hashedPassword, id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  findByEmail,
  createUser,
  findPendingWholesalers,
  updateUserStatus,
  findApprovedWholesalers,
  findBuyers,
  findById,
  updateUserProfile,
  updateUserPassword
};