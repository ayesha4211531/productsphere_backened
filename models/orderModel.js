const db = require("../config/db");

// Get all orders
const getAllOrders = async () => {
  const [rows] = await db.query(
    `SELECT id, buyer_id, buyer_name, shipping_address, phone, payment_method, payment_status, status, items, total_amount, created_at FROM orders`
  );
  return rows;
};

// Create a new order
const createOrder = async ({ buyer_id, buyer_name, shipping_address, phone, payment_method, payment_status, status, items, total_amount }) => {
  const [result] = await db.query(
    `INSERT INTO orders (buyer_id, buyer_name, shipping_address, phone, payment_method, payment_status, status, items, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      buyer_id,
      buyer_name,
      shipping_address,
      phone,
      payment_method,
      payment_status || 'pending',
      status || 'pending',
      JSON.stringify(items),
      total_amount
    ]
  );
  return result.insertId;
};

// Get orders by buyer ID
const getOrdersByBuyer = async (buyerId) => {
  const [rows] = await db.query(
    `SELECT id, buyer_id, buyer_name, shipping_address, phone, payment_method, payment_status, status, items, total_amount, created_at FROM orders WHERE buyer_id = ?`,
    [buyerId]
  );
  return rows;
};

module.exports = {
  getAllOrders,
  createOrder,
  getOrdersByBuyer
};