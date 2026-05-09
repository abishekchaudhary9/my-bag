const orderService = require("../services/orderService");

async function createOrder(req, res) {
  const order = await orderService.createOrder(req.user, req.body);
  res.status(201).json({ order });
}

async function listOrders(req, res) {
  const orders = await orderService.listUserOrders(req.user.id);
  res.json({ orders });
}

async function getOrder(req, res) {
  const order = await orderService.getUserOrder(req.params.orderNumber, req.user.id);
  res.json({ order });
}

async function initiateKhalti(req, res) {
  const { amount, purchase_order_id, purchase_order_name, return_url, website_url, customer_info } = req.body;
  
  try {
    const response = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
      method: "POST",
      headers: {
        "Authorization": "Key 763829f3ec654a02a78de16937109282", // Live Secret Key provided by user
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

module.exports = {
  createOrder,
  listOrders,
  getOrder,
  initiateKhalti,
};
