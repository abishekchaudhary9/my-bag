const Order = require("../models/orderModel");
const CartItem = require("../models/cartModel");
const Product = require("../models/productModel");
const createHttpError = require("../utils/httpError");
const { emitEvent } = require("../lib/socket");

async function createOrder(userId, orderData) {
  const { 
    items, subtotal, shipping, discount, total, 
    shippingAddress, paymentMethod 
  } = orderData;

  const orderNumber = "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  const order = new Order({
    order_number: orderNumber,
    user: userId,
    subtotal,
    shipping,
    discount,
    total,
    shipping_address: {
      first_name: shippingAddress.firstName,
      last_name: shippingAddress.lastName,
      email: shippingAddress.email,
      phone: shippingAddress.phone,
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zip: shippingAddress.zip,
      country: shippingAddress.country
    },
    payment_method: paymentMethod,
    items: items.map(item => ({
      product_name: item.name,
      color: item.color,
      size: item.size,
      qty: item.qty,
      price: item.price,
      image: item.image
    }))
  });

  await order.save();

  // Clear cart
  await CartItem.deleteMany({ user: userId });

  // Update stock
  for (const item of items) {
    await Product.findOneAndUpdate(
      { name: item.name }, // Should ideally use ID but keeping it simple for now
      { $inc: { stock: -item.qty } }
    );
  }

  // Real-time notification for admins
  emitEvent("admins", "new_order", { 
    orderNumber: order.order_number, 
    total: order.total 
  });

  return { order: order.toJSON() };
}

async function getUserOrders(userId) {
  const filter = userId ? { user: userId } : {};
  const orders = await Order.find(filter).sort({ created_at: -1 });
  return { orders: orders.map(o => o.toJSON()) };
}

async function getOrderDetails(orderNumber) {
  const order = await Order.findOne({ order_number: orderNumber });
  if (!order) {
    throw createHttpError(404, "Order not found");
  }
  return { order: order.toJSON() };
}

async function updateOrderStatus(orderNumber, status, trackingNumber) {
  const updates = { status };
  if (trackingNumber) updates.tracking_number = trackingNumber;

  const order = await Order.findOneAndUpdate(
    { order_number: orderNumber },
    { $set: updates },
    { new: true }
  );

  if (!order) {
    throw createHttpError(404, "Order not found");
  }

  // Notify user via socket
  emitEvent(`user_${order.user}`, "order_update", { 
    orderNumber: order.order_number, 
    status: order.status 
  });

  return { order: order.toJSON() };
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus
};
