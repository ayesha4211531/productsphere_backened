const ProductModel = require("../models/productModel");
const UserModel = require("../models/userModel");

const getWholesalerProducts = async (req, res) => {
  const { wholesalerId } = req.params;

  try {
    // Only allow wholesalers to access their own products, or admin
    if (req.user.role !== "admin" && req.user.id !== parseInt(wholesalerId)) {
      return res.status(403).json({ success: false, message: "Unauthorized access to these products." });
    }

    const products = await ProductModel.getProductsByWholesaler(wholesalerId);
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (err) {
    console.error("getWholesalerProducts error:", err);
    return res.status(500).json({ success: false, message: "Server error retrieving products" });
  }
};

const createProduct = async (req, res) => {
  const { name, description, price, original_price, quantity, category, wholesaler_id, wholesaler_name, product_image } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ success: false, message: "Name, price, and category are required" });
  }

  try {
    let finalWholesalerId;
    let finalWholesalerName;

    if (req.user.role === "admin") {
      if (!wholesaler_id || !wholesaler_name) {
        return res.status(400).json({ success: false, message: "wholesaler_id and wholesaler_name are required when Admin publishes on behalf of a wholesaler" });
      }
      finalWholesalerId = wholesaler_id;
      finalWholesalerName = wholesaler_name;
    } else if (req.user.role === "wholesaler") {
      const user = await UserModel.findByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({ success: false, message: "Wholesaler profile not found" });
      }
      finalWholesalerId = user.id;
      finalWholesalerName = user.name;
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized. Wholesaler or Admin role required." });
    }

    const productId = await ProductModel.createProduct({
      name,
      description,
      price,
      original_price: original_price || price,
      quantity: quantity || 1,
      category,
      wholesaler_id: finalWholesalerId,
      wholesaler_name: finalWholesalerName,
      status: 'active',
      product_image: product_image || null
    });

    console.log(`📦 Product created by ${req.user.role === 'admin' ? 'Admin' : 'Wholesaler'}: "${name}" (#${productId})`);
    return res.status(201).json({
      success: true,
      message: "Product published successfully.",
      data: { id: productId, name, category, price }
    });
  } catch (err) {
    console.error("createProduct error:", err);
    return res.status(500).json({ success: false, message: "Server error publishing product" });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, original_price, quantity, category, product_image } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ success: false, message: "Name, price, and category are required" });
  }

  try {
    if (req.user.role !== "wholesaler" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized. Wholesaler or Admin role required." });
    }

    const updated = await ProductModel.updateProduct(id, {
      name,
      description,
      price,
      original_price: original_price || price,
      quantity: quantity || 1,
      category,
      product_image: product_image !== undefined ? product_image : null
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Product not found or update failed" });
    }

    console.log(`📦 Product updated by Wholesaler: "${name}" (#${id})`);
    return res.status(200).json({
      success: true,
      message: "Product details updated successfully."
    });
  } catch (err) {
    console.error("updateProduct error:", err);
    return res.status(500).json({ success: false, message: "Server error updating product" });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== "wholesaler" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this product." });
    }

    const deleted = await ProductModel.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found or deletion failed" });
    }

    console.log(`📦 Product deleted: Product #${id}`);
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully."
    });
  } catch (err) {
    console.error("deleteProduct error:", err);
    return res.status(500).json({ success: false, message: "Server error deleting product" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.getAllProducts();
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (err) {
    console.error("getAllProducts error:", err);
    return res.status(500).json({ success: false, message: "Server error retrieving products" });
  }
};

const getApprovedWholesalersList = async (req, res) => {
  try {
    const wholesalers = await UserModel.findApprovedWholesalers();
    return res.status(200).json({
      success: true,
      data: wholesalers
    });
  } catch (err) {
    console.error("getApprovedWholesalersList error:", err);
    return res.status(500).json({ success: false, message: "Server error retrieving wholesalers." });
  }
};

module.exports = {
  getWholesalerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getApprovedWholesalersList
};