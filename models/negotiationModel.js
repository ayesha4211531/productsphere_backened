const db = require("../config/db");

const createNegotiation = async ({
  buyer_id,
  buyer_name,
  product_id,
  product_name,
  price,
  quantity,
  bid_price,
  status,
  message,
  wholesaler_id
}) => {
  const [result] = await db.query(
    `INSERT INTO negotiations
    (buyer_id, buyer_name, product_id, product_name, price, quantity, bid_price, status, message, wholesaler_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      buyer_id,
      buyer_name,
      product_id,
      product_name,
      price,
      quantity,
      bid_price,
      status || "pending",
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
      wholesaler_id,
      created_at
    FROM negotiations
    WHERE buyer_id = ?`,
    [buyerId]
  );

  return rows;
};

const getNegotiationsByWholesaler = async (wholesalerId) => {
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
      wholesaler_id,
      created_at
    FROM negotiations
    WHERE wholesaler_id = ?`,
    [wholesalerId]
  );

  return rows;
};


// UPDATE BID STATUS + MESSAGE
const updateNegotiationStatus = async (id, status, message) => {
  try {
    console.log("🔍 Updating Bid ID:", id);
    console.log("🔍 New Status:", status);
    console.log("🔍 Message:", message);

    const [result] = await db.query(
      `UPDATE negotiations
       SET status = ?, message = ?
       WHERE id = ?`,
      [
        status,
        message || null,
        id
      ]
    );

    console.log("✅ Update result:", result);

    // Bid exist karti hai ya nahi check karo
    const [rows] = await db.query(
      `SELECT id, status, message
       FROM negotiations
       WHERE id = ?`,
      [id]
    );

    console.log("🔍 Bid after update:", rows);

    if (rows.length === 0) {
      console.log("❌ Bid ID not found:", id);
      return false;
    }

    console.log("✅ Bid exists and was processed successfully");

    return true;

  } catch (error) {
    console.error("❌ updateNegotiationStatus error:", error);
    throw error;
  }
};

const getAllNegotiations = async () => {
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
      wholesaler_id,
      created_at
    FROM negotiations`
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