const db = require("../config/db");

// Get all categories
const getAllCategories = async () => {
  const [rows] = await db.query(
    `SELECT id, name, description FROM categories`
  );
  return rows;
};

// Create a new category
const createCategory = async ({ name, description }) => {
  const [result] = await db.query(
    `INSERT INTO categories (name, description) VALUES (?, ?)`,
    [name, description || null]
  );
  return result.insertId;
};

// Update an existing category
const updateCategory = async (id, { name, description }) => {
  const [result] = await db.query(
    `UPDATE categories SET name = ?, description = ? WHERE id = ?`,
    [name, description || null, id]
  );
  return result.affectedRows > 0;
};

// Delete a category by ID
const deleteCategory = async (id) => {
  const [result] = await db.query(
    `DELETE FROM categories WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};