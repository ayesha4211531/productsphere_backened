const db = require("../config/db");

// Get all products in the catalog
const getAllProducts = async () => {
  const [rows] = await db.query(
    `SELECT id, name, description, price, original_price, quantity, category, wholesaler_id, wholesaler_name, status, product_image FROM products`
  );
  return rows;
};

// Create a new product in the catalog
const createProduct = async ({ name, description, price, original_price, quantity, category, wholesaler_id, wholesaler_name, status, product_image }) => {
  const [result] = await db.query(
    `INSERT INTO products (name, description, price, original_price, quantity, category, wholesaler_id, wholesaler_name, status, product_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      description || null,
      price,
      original_price,
      quantity || 1,
      category,
      wholesaler_id,
      wholesaler_name,
      status || 'active',
      product_image || null
    ]
  );
  return result.insertId;
};

// Delete a product from the catalog by ID
const deleteProduct = async (id) => {
  const [result] = await db.query(
    `DELETE FROM products WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

// Update product status (e.g. active, flagged)
const updateProductStatus = async (id, status) => {
  const [result] = await db.query(
    `UPDATE products SET status = ? WHERE id = ?`,
    [status, id]
  );
  return result.affectedRows > 0;
};

// Get products by wholesaler ID
const getProductsByWholesaler = async (wholesalerId) => {
  const [rows] = await db.query(
    `SELECT id, name, description, price, original_price, quantity, category, wholesaler_id, wholesaler_name, status, product_image FROM products WHERE wholesaler_id = ?`,
    [wholesalerId]
  );
  return rows;
};

// Update product details
const updateProduct = async (id, { name, description, price, original_price, quantity, category, product_image }) => {
  const [result] = await db.query(
    `UPDATE products SET name = ?, description = ?, price = ?, original_price = ?, quantity = ?, category = ?, product_image = ? WHERE id = ?`,
    [
      name,
      description || null,
      price,
      original_price,
      quantity || 1,
      category,
      product_image !== undefined ? product_image : null,
      id
    ]
  );
  return result.affectedRows > 0;
};

module.exports = {
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProductStatus,
  getProductsByWholesaler,
  updateProduct
};