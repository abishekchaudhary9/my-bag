const orderService = require("../services/orderService");

async function createOrder(req, res) {
  const result = await orderService.createOrder(req.user.id, req.body);
  res.status(201).json(result);
}

async function listOrders(req, res) {
  const result = await orderService.getUserOrders(req.user.id);
  res.json(result);
}

async function getOrder(req, res) {
  const result = await orderService.getOrderDetails(req.params.orderNumber);
  res.json(result);
}

async function initiateKhalti(req, res) {
  const { amount, purchase_order_id, purchase_order_name, return_url, website_url, customer_info } = req.body;

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
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error("Khalti initiation error:", err);
    res.status(500).json({ error: "Failed to connect to Khalti." });
  }
}

async function trackOrder(req, res) {
  const result = await orderService.trackOrder(req.params.trackingNumber);
  res.json(result);
}

async function verifyPayment(req, res) {
  const { orderId, pidx, method } = req.body;
  const result = await orderService.verifyPayment(orderId, pidx, method);
  res.json(result);
}

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  initiateKhalti,
  trackOrder,
  verifyPayment,
};
