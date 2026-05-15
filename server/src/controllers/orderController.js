const orderService = require("../services/orderService");
const { success } = require("../utils/responseHandler");
const createHttpError = require("../utils/httpError");

async function createOrder(req, res) {
  const result = await orderService.createOrder(req.user.id, req.body);
  res.status(201).json(success(result, "Order created successfully", 201));
}

async function listOrders(req, res) {
  const result = await orderService.getUserOrders(req.user.id);
  res.json(success(result, "Orders retrieved"));
}

async function getOrder(req, res) {
  const result = await orderService.getOrderDetails(req.params.orderNumber);
  res.json(success(result, "Order details retrieved"));
}

async function initiateKhalti(req, res) {
  const { amount, purchase_order_id, purchase_order_name, return_url, website_url, customer_info } = req.body;

  if (!process.env.KHALTI_SECRET_KEY) {
    throw createHttpError(500, "Khalti payment is not configured.");
  }

  if (!amount || !purchase_order_id || !purchase_order_name || !return_url || !website_url) {
    throw createHttpError(400, "Missing required Khalti payment details.");
  }

  try {
    const response = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        return_url,
        website_url,
        amount: Math.round(amount * 100), // convert Rupee to Paisa
        purchase_order_id,
        purchase_order_name,
        customer_info
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.detail || data?.message || "Khalti payment initiation failed.";
      throw createHttpError(response.status, message);
    }

    res.json(success(data, "Khalti payment initiated"));
  } catch (err) {
    if (err.statusCode || err.status) {
      throw err;
    }

    console.error("Khalti initiation error:", err);
    throw createHttpError(502, "Failed to connect to Khalti.");
  }
}

async function trackOrder(req, res) {
  const result = await orderService.trackOrder(req.params.trackingNumber);
  res.json(success(result, "Order tracking info retrieved"));
}

async function verifyPayment(req, res) {
  const { orderId, pidx, method } = req.body;
  const result = await orderService.verifyPayment(orderId, pidx, method);
  res.json(success(result, "Payment verified successfully"));
}

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  initiateKhalti,
  trackOrder,
  verifyPayment,
};
