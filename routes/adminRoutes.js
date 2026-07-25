const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
 getPendingWholesalers, 
 updateBusinessStatus,
 getApprovedWholesalers,
 getBuyers,
 getAdminOrders,
} = require("../controllers/adminController");

router.get("/pending-wholesalers", authMiddleware, getPendingWholesalers);
router.post("/update-status", authMiddleware, updateBusinessStatus);
router.get("/wholesalers", authMiddleware, getApprovedWholesalers);
router.get("/buyers", authMiddleware, getBuyers);
router.get("/orders", authMiddleware, getAdminOrders);


module.exports = router;
