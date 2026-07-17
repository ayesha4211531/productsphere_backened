const OrderModel = require("../models/orderModel");
const UserModel = require("../models/userModel");
const db = require("../config/db");

const createOrder = async (req, res) => {
  const { shipping_address, phone, payment_method, items, total_amount, payment_proof } = req.body;

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
      total_amount,
      payment_proof: payment_proof || null
    });

    console.log(`📦 Checkout completed. Order #${orderId} created for Buyer ${user.name}`);

    // --- Basic Stock Management: Decrease Product Quantities ---
    try {
      const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
      const [allProducts] = await db.query("SELECT * FROM products");
      for (const item of parsedItems) {
        const productId = parseInt(item.product_id);
        const quantityOrdered = parseInt(item.quantity);
        
        const prod = allProducts.find(p => p.id === productId);
        if (prod) {
          const newQty = Math.max(0, parseInt(prod.quantity || 0) - quantityOrdered);
          await db.query(
            "UPDATE products SET name = ?, description = ?, price = ?, original_price = ?, quantity = ?, category = ?, product_image = ? WHERE id = ?",
            [
              prod.name || '',
              prod.description || null,
              prod.price || 0,
              prod.original_price || 0,
              newQty,
              prod.category || 'General',
              prod.product_image || null,
              prod.id
            ]
          );
          console.log(`📉 Stock updated for product #${productId}: ${prod.quantity} -> ${newQty}`);
        }
      }
    } catch (stockErr) {
      console.error("Stock update error during checkout:", stockErr);
    }

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
    
    // Fetch products to map wholesaler details
    const [products] = await db.query("SELECT id, wholesaler_id, wholesaler_name FROM products");
    const productMap = {};
    products.forEach(p => {
      productMap[p.id] = {
        wholesaler_id: p.wholesaler_id,
        wholesaler_name: p.wholesaler_name
      };
    });

    const resolved = orders.map(order => {
      let itemsList = [];
      try {
        itemsList = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch (e) {
        itemsList = [];
      }

      const updatedItems = itemsList.map(item => {
        const prodInfo = productMap[item.product_id] || {};
        return {
          ...item,
          wholesaler_id: item.wholesaler_id || prodInfo.wholesaler_id || null,
          wholesaler_name: item.wholesaler_name || prodInfo.wholesaler_name || 'Wholesaler'
        };
      });

      return {
        ...order,
        items: updatedItems
      };
    });

    return res.status(200).json({
      success: true,
      data: resolved
    });
  } catch (err) {
    console.error("getBuyerOrders error:", err);
    return res.status(500).json({ success: false, message: "Server error retrieving orders." });
  }
};

const getWholesalerOrders = async (req, res) => {
  try {
    const user = await UserModel.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    const allOrders = await OrderModel.getAllOrders();
    
    // Fetch products to map wholesaler details
    const [products] = await db.query("SELECT id, wholesaler_id, wholesaler_name FROM products");
    const productMap = {};
    products.forEach(p => {
      productMap[p.id] = {
        wholesaler_id: p.wholesaler_id,
        wholesaler_name: p.wholesaler_name
      };
    });

    const filtered = allOrders.filter(order => {
      let itemsList = [];
      try {
        itemsList = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch (e) {
        itemsList = [];
      }

      return itemsList.some(item => {
        const wId = item.wholesaler_id || (productMap[item.product_id] ? productMap[item.product_id].wholesaler_id : null);
        return parseInt(wId) === parseInt(user.id);
      });
    });

    const resolvedData = filtered.map(order => {
      let itemsList = [];
      try {
        itemsList = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch (e) {
        itemsList = [];
      }

      const updatedItems = itemsList.map(item => {
        const prodInfo = productMap[item.product_id] || {};
        return {
          ...item,
          wholesaler_id: item.wholesaler_id || prodInfo.wholesaler_id || null,
          wholesaler_name: item.wholesaler_name || prodInfo.wholesaler_name || 'Wholesaler'
        };
      });

      return {
        ...order,
        items: updatedItems
      };
    });

    return res.status(200).json({
      success: true,
      data: resolvedData
    });
  } catch (err) {
    console.error("getWholesalerOrders error:", err);
    return res.status(500).json({ success: false, message: "Server error retrieving wholesaler orders." });
  }
};

const updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;
  if (!orderId || !status) {
    return res.status(400).json({ success: false, message: "Missing orderId or status." });
  }

  try {
    const updated = await OrderModel.updateOrderStatus(orderId, status);
    if (updated) {
      return res.status(200).json({ success: true, message: "Order status updated successfully." });
    }
    return res.status(404).json({ success: false, message: "Order not found or no status change." });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error updating order status." });
  }
};

module.exports = {
  createOrder,
  getBuyerOrders,
  getWholesalerOrders,
  updateOrderStatus
};