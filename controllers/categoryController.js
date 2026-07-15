const CategoryModel = require("../models/categoryModel");

const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.getAllCategories();
    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (err) {
    console.error("getAllCategories error:", err);
    return res.status(500).json({ success: false, message: "Server error retrieving categories" });
  }
};

const createCategory = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: "Category name is required" });
  }

  try {
    // Only allow admin role to create a category
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
    }

    const categoryId = await CategoryModel.createCategory({ name, description });
    console.log(`🏷️ Category created by Admin: "${name}" (#${categoryId})`);
    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: { id: categoryId, name, description }
    });
  } catch (err) {
    console.error("createCategory error:", err);
    if (err.message === "Category already exists") {
      return res.status(400).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: "Server error creating category" });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: "Category name is required" });
  }

  try {
    // Only allow admin role to update a category
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
    }

    const updated = await CategoryModel.updateCategory(id, { name, description });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Category not found or update failed" });
    }

    console.log(`🏷️ Category updated by Admin: "${name}" (#${id})`);
    return res.status(200).json({
      success: true,
      message: "Category updated successfully."
    });
  } catch (err) {
    console.error("updateCategory error:", err);
    return res.status(500).json({ success: false, message: "Server error updating category" });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Only allow admin role to delete a category
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized. Admin privileges required." });
    }

    const deleted = await CategoryModel.deleteCategory(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Category not found or deletion failed" });
    }

    console.log(`🏷️ Category deleted by Admin: Category #${id}`);
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully."
    });
  } catch (err) {
    console.error("deleteCategory error:", err);
    return res.status(500).json({ success: false, message: "Server error deleting category" });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};