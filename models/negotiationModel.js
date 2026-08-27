const db = require("../config/db");

const createNegotiation = async ({ buyer_id, buyer_name, product_id, product_name, price, quantity, bid_price, status, message, wholesaler_id }) => {
  const [result] = await db.query(
    `INSERT INTO negotiations (buyer_id, buyer_name, product_id, product_name, price, quantity, bid_price, status, message, wholesaler_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      buyer_id,
      buyer_name,
      product_id,
      product_name,
      price,
      quantity,
      bid_price,
      status || 'pending',
      message || null,
      wholesaler_id
    ]
  );
  return result.insertId;
};

const getNegotiationsByBuyer = async (buyerId) => {
  const [rows] = await db.query(
    `SELECT 
      id,
      buyer_id,
      buyer_name,
      product_id,
      product_name,
      price,
      quantity,
      bid_price,
      status,
      message,
      rejection_message,
      wholesaler_id,
      (SELECT name FROM users WHERE users.id = negotiations.wholesaler_id) AS wholesaler_name,
      created_at
    FROM negotiations
    WHERE buyer_id = ?`,
    [buyerId]
  );

  return rows;
};

const getNegotiationsByWholesaler = async (wholesalerId) => {
  const [rows] = await db.query(
    `SELECT id, buyer_id, buyer_name, product_id, product_name, price, quantity, bid_price, status, message, wholesaler_id, created_at FROM negotiations WHERE wholesaler_id = ?`,
    [wholesalerId]
  );
  return rows;
};

const updateNegotiationStatus = async (
  id,
  status,
  rejectionMessage = null
) => {
  const [result] = await db.query(
    `UPDATE negotiations
     SET status = ?, rejection_message = ?
     WHERE id = ?`,
    [
      status,
      rejectionMessage || null,
      id
    ]
  );

  return result.affectedRows > 0;
};

const getAllNegotiations = async () => {
  const [rows] = await db.query(
    `SELECT id, buyer_id, buyer_name, product_id, product_name, price, quantity, bid_price, status, message, wholesaler_id, created_at FROM negotiations`
  );
  return rows;
};

module.exports = {
  createNegotiation,
  getNegotiationsByBuyer,
  getNegotiationsByWholesaler,
  updateNegotiationStatus,
  getAllNegotiations
};