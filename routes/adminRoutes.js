const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getPendingWholesalers, updateBusinessStatus } = require("../controllers/adminController");

router.get("/pending-wholesalers", authMiddleware, getPendingWholesalers);
router.post("/update-status", authMiddleware, updateBusinessStatus);

module.exports = router;
