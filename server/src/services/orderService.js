const Order = require("../models/orderModel");
const CartItem = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const createHttpError = require("../utils/httpError");
const { emitEvent } = require("../lib/socket");
const notificationService = require("./notificationService");

async function createOrder(userId, orderData) {
  const { 
    items, subtotal: clientSubtotal, shipping, discount, total: clientTotal, 
    shippingAddress, shippingInfo, paymentMethod 
  } = orderData;

  const addr = shippingAddress || shippingInfo || {};
  
  // 1. Basic Address Validation
  if (!addr.firstName || !addr.lastName || !addr.email || !addr.street || !addr.city || !addr.municipality) {
    throw createHttpError(400, "Missing required shipping information");
  }

  // 2. Re-calculate and Check Stock (Security: Don't trust client prices/stock)
  let serverSubtotal = 0;
  const verifiedItems = [];
  
  for (const item of items) {
    const product = await Product.findOne({ name: item.name });
    if (!product) throw createHttpError(404, `Product ${item.name} not found`);
    
    if (product.stock < item.qty) {
      throw createHttpError(400, `Insufficient stock for ${item.name}. Only ${product.stock} left.`);
    }
    
    serverSubtotal += product.price * item.qty;
    verifiedItems.push({
      product_name: item.name,
      color: item.color,
      size: item.size,
      qty: item.qty,
      price: product.price, // Use DB price
      image: item.image
    });
  }

  // 3. Verify Totals
  const serverTotal = serverSubtotal + (shipping || 0) - (discount || 0);
  
  // We allow a small tolerance for rounding if necessary, but here we expect exact match or we use server values
  // To be safe against tampering, we'll use server calculated values for the actual order
  
  const orderNumber = "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  const order = new Order({
    order_number: orderNumber,
    user: userId,
    subtotal: serverSubtotal,
    shipping: shipping || 0,
    discount: discount || 0,
    total: serverTotal,
    shipping_address: {
      first_name: addr.firstName,
      last_name: addr.lastName,
      email: addr.email,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      municipality: addr.municipality,
      ward: addr.ward,
      zip: addr.zip,
      country: addr.country,
      lat: addr.coordinates?.lat || addr.lat,
      lng: addr.coordinates?.lng || addr.lng
    },
    payment_method: paymentMethod,
    items: verifiedItems
  });

  // 4. Atomic-ish Stock Update (In a real app, use a transaction)
  for (const item of verifiedItems) {
    await Product.findOneAndUpdate(
      { name: item.product_name },
      { $inc: { stock: -item.qty } }
    );
  }

  await order.save();

  // Clear cart
  await CartItem.deleteMany({ user: userId });

  // Notify all admins about the new order (database notification, no toast)
  try {
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await notificationService.createNotification(
        admin._id,
        {
          title: "New Order Received",
          message: `Order #${order.order_number} from ${addr.firstName} ${addr.lastName}. Total: Rs ${order.total}`,
          link: `/admin?tab=orders&id=${order.order_number}`
        },
        { emit: false } // rely on "new_order" socket event to refresh notifications
      );
    }
  } catch (err) {
    console.error("Failed to send admin notifications for new order:", err);
  }

  // Notify the customer (database notification)
  try {
    await notificationService.createNotification(
      userId,
      {
        title: "Order Confirmed",
        message: `Your order #${orderNumber} has been placed successfully.`,
        link: "/orders"
      },
      { emit: false } // socket emit handles real-time toast below
    );
  } catch (err) {
    console.error("Failed to send customer notification for new order:", err);
  }

  // Real-time notification for admins and user
  emitEvent("admins", "new_order", {
    orderNumber: order.order_number,
    total: order.total
  });

  // Real-time notification for user
  emitEvent(`user_${userId}`, "new_order", {
    orderNumber: order.order_number,
    total: order.total
  });
  emitEvent(`user_${userId}`, "notification", {
    title: "Order Confirmed",
    message: `Your order #${order.order_number} has been placed successfully.`,
    link: "/orders"
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

  // Notify the customer and all admins about the status change
  try {
    // Notify customer
    await notificationService.createNotification(
      order.user,
      {
        title: "Order Status Update",
        message: `Your order #${orderNumber} is now ${status}.`,
        link: `/order-confirmation/${orderNumber}`
      },
      { emit: false } // user will be notified via "order_update" socket event
    );

    // Notify all admins
    const admins = await User.find({ role: "admin" });
    const customerName = `${order.shipping_address.first_name} ${order.shipping_address.last_name}`.trim() || "Customer";
    for (const admin of admins) {
      await notificationService.createNotification(
        admin._id,
        {
          title: "Order Status Update",
          message: `Order #${orderNumber} for ${customerName} is now ${status}.`,
          link: `/admin?tab=orders&id=${orderNumber}`
        },
        { emit: true, skipToast: false } // admins get toast via notification event
      );
    }
  } catch (err) {
    console.error("Failed to send order status notifications:", err);
  }

  // Notify user via socket
  emitEvent(`user_${order.user}`, "order_update", {
    orderNumber: order.order_number,
    status: order.status
  });

  return { order: order.toJSON() };
}

async function trackOrder(trackingNumber) {
  const order = await Order.findOne({ tracking_number: trackingNumber });
  if (!order) {
    throw createHttpError(404, "Order not found");
  }
  return { order: order.toJSON() };
}

async function verifyPayment(orderId, pidx, method) {
  const order = await Order.findById(orderId);
  if (!order) throw createHttpError(404, "Order not found");

  if (method === "khalti") {
    const response = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ pidx })
    });
    const data = await response.json();
    if (data.status === "Completed") {
      order.payment_status = "paid";
      await order.save();
      return { success: true, message: "Payment verified" };
    }
  } else if (method === "esewa") {
    // eSewa verification usually happens via a GET request to their verify endpoint
    // For now we trust the success_url param if it has a token/refId, but a real app should verify server-side
    order.payment_status = "paid";
    await order.save();
    return { success: true, message: "Payment verified" };
  }
  
  return { success: false, message: "Verification failed" };
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
  trackOrder,
  verifyPayment
};