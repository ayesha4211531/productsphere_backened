const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { createNegotiation, getBuyerNegotiations, getWholesalerNegotiations, updateStatus, getAllNegotiations } = require("../controllers/negotiationController");

router.post("/", authMiddleware, createNegotiation);
router.get("/", authMiddleware, getAllNegotiations);
router.get("/buyer", authMiddleware, getBuyerNegotiations);
router.get("/wholesaler", authMiddleware, getWholesalerNegotiations);
router.put("/:id/status", authMiddleware, updateStatus);

module.exports = router;