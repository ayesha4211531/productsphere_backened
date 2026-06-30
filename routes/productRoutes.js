const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getWholesalerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts
} = require("../controllers/productController");

router.get("/", authMiddleware, getAllProducts);
router.get("/wholesaler/:wholesalerId", authMiddleware, getWholesalerProducts);
router.post("/", authMiddleware, createProduct);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;