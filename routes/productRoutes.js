const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getAllProducts,
  getWholesalerProducts,
  getApprovedWholesalersList,
  createProduct,
  updateProduct,
  deleteProduct,
 
} = require("../controllers/productController");

router.get("/", authMiddleware, getAllProducts);
router.get("/wholesaler/:wholesalerId", authMiddleware, getWholesalerProducts);
router.get("/wholesalers", authMiddleware, getApprovedWholesalersList);
router.post("/", authMiddleware, createProduct);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;