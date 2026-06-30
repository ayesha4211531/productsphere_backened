const OrderModel = require("../models/orderModel");
const UserModel = require("../models/userModel");

const createOrder = async (req, res) => {
  const { shipping_address, phone, payment_method, items, total_amount } = req.body;

  if (!shipping_address || !phone || !payment_method || !items || !total_amount) {
    return res.status(400).json({ success: false, message: "Missing required checkout fields." });
  }

  try {
    const user = await UserModel.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: "Buyer profile not found." });
    }

    const orderId = await OrderModel.createOrder({
      buyer_id: user.id,
      buyer_name: user.name,
      shipping_address,
      phone,
      payment_method,
      payment_status: payment_method === 'online' ? 'paid' : 'pending',
      status: 'pending',
      items,
      total_amount
    });

    console.log(`📦 Checkout completed. Order #${orderId} created for Buyer ${user.name}`);
    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      orderId
    });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ success: false, message: "Server error processing checkout." });
  }
};

const getBuyerOrders = async (req, res) => {
  try {
    const user = await UserModel.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    const orders = await OrderModel.getOrdersByBuyer(user.id);
    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    console.error("getBuyerOrders error:", err);
    return res.status(500).json({ success: false, message: "Server error retrieving orders." });
  }
};

module.exports = {
  createOrder,
  getBuyerOrders
};