const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { createOrder, getBuyerOrders, getWholesalerOrders, updateOrderStatus } = require("../controllers/orderController");

router.post("/checkout", authMiddleware, createOrder);
router.get("/my-orders", authMiddleware, getBuyerOrders);
router.get("/wholesaler", authMiddleware, getWholesalerOrders);
router.post("/update-status", authMiddleware, updateOrderStatus);

module.exports = router;