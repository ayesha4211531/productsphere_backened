const NegotiationModel = require("../models/negotiationModel");
const UserModel = require("../models/userModel");

const createNegotiation = async (req, res) => {
  const { product_id, product_name, price, quantity, bid_price, message, wholesaler_id } = req.body;

  if (!product_id || !product_name || !price || !quantity || !bid_price || !wholesaler_id) {
    return res.status(400).json({ success: false, message: "Missing required negotiation parameters." });
  }

  try {
    const user = await UserModel.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: "Buyer profile not found." });
    }

    const bidId = await NegotiationModel.createNegotiation({
      buyer_id: user.id,
      buyer_name: user.name,
      product_id,
      product_name,
      price,
      quantity,
      bid_price,
      status: 'pending',
      message,
      wholesaler_id
    });

    console.log(`🤝 Price negotiation bid #${bidId} submitted by Buyer ${user.name} for product: ${product_name}`);
    return res.status(201).json({
      success: true,
      message: "Bid submitted successfully.",
      bidId
    });
  } catch (err) {
    console.error("createNegotiation error:", err);
    return res.status(500).json({ success: false, message: "Server error processing bid." });
  }
};

const getBuyerNegotiations = async (req, res) => {
  try {
    const user = await UserModel.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    const bids = await NegotiationModel.getNegotiationsByBuyer(user.id);
    return res.status(200).json({
      success: true,
      data: bids
    });
  } catch (err) {
    console.error("getBuyerNegotiations error:", err);
    return res.status(500).json({ success: false, message: "Server error retrieving bids." });
  }
};

const getWholesalerNegotiations = async (req, res) => {
  try {
    const user = await UserModel.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    const bids = await NegotiationModel.getNegotiationsByWholesaler(user.id);
    return res.status(200).json({
      success: true,
      data: bids
    });
  } catch (err) {
    console.error("getWholesalerNegotiations error:", err);
    return res.status(500).json({ success: false, message: "Server error retrieving bids." });
  }
};

const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: "Status parameter is required." });
  }

  try {
    const updated = await NegotiationModel.updateNegotiationStatus(id, status);
    if (updated) {
      return res.status(200).json({
        success: true,
        message: `Bid status updated to ${status}.`
      });
    } else {
      return res.status(404).json({ success: false, message: "Bid not found." });
    }
  } catch (err) {
    console.error("updateStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error updating status." });
  }
};

const getAllNegotiations = async (req, res) => {
  try {
    const user = await UserModel.findByEmail(req.user.email);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Forbidden. Admin access only." });
    }

    const bids = await NegotiationModel.getAllNegotiations();
    return res.status(200).json({
      success: true,
      data: bids
    });
  } catch (err) {
    console.error("getAllNegotiations error:", err);
    return res.status(500).json({ success: false, message: "Server error retrieving negotiations." });
  }
};

module.exports = {
  createNegotiation,
  getBuyerNegotiations,
  getWholesalerNegotiations,
  updateStatus,
  getAllNegotiations
};