const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { createOrder, getBuyerOrders } = require("../controllers/orderController");

router.post("/checkout", authMiddleware, createOrder);
router.get("/my-orders", authMiddleware, getBuyerOrders);

module.exports = router;