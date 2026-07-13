const db = require("../config/db");

// Get all orders
const getAllOrders = async () => {
  const [rows] = await db.query(
    `SELECT id, buyer_id, buyer_name, shipping_address, phone, payment_method, payment_status, status, items, total_amount, payment_proof, created_at FROM orders`
  );
  return rows;
};

// Create a new order
const createOrder = async ({ buyer_id, buyer_name, shipping_address, phone, payment_method, payment_status, status, items, total_amount, payment_proof }) => {
  const [result] = await db.query(
    `INSERT INTO orders (buyer_id, buyer_name, shipping_address, phone, payment_method, payment_status, status, items, total_amount, payment_proof) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      buyer_id,
      buyer_name,
      shipping_address,
      phone,
      payment_method,
      payment_status || 'pending',
      status || 'pending',
      JSON.stringify(items),
      total_amount,
      payment_proof || null
    ]
  );
  return result.insertId;
};

// Get orders by buyer ID
const getOrdersByBuyer = async (buyerId) => {
  const [rows] = await db.query(
    `SELECT id, buyer_id, buyer_name, shipping_address, phone, payment_method, payment_status, status, items, total_amount, payment_proof, created_at FROM orders WHERE buyer_id = ?`,
    [buyerId]
  );
  return rows;
};

// Update order status
const updateOrderStatus = async (orderId, status) => {
  const [result] = await db.query(
    `UPDATE orders SET status = ? WHERE id = ?`,
    [status, orderId]
  );
  return result.affectedRows > 0;
};

module.exports = {
  getAllOrders,
  createOrder,
  getOrdersByBuyer,
  updateOrderStatus
};