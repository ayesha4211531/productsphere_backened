const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { 
  getPendingWholesalers, 
  updateBusinessStatus,
  getAllProducts,
  deleteProduct,
  updateProductStatus,
  getApprovedWholesalers,
  getBuyers,
  getAdminOrders
} = require("../controllers/adminController");

router.get("/pending-wholesalers", authMiddleware, getPendingWholesalers);
router.post("/update-status", authMiddleware, updateBusinessStatus);
router.get("/wholesalers", authMiddleware, getApprovedWholesalers);
router.get("/buyers", authMiddleware, getBuyers);
router.get("/orders", authMiddleware, getAdminOrders);

router.get("/products", authMiddleware, getAllProducts);
router.delete("/products/:id", authMiddleware, deleteProduct);
router.post("/products/status", authMiddleware, updateProductStatus);

module.exports = router;