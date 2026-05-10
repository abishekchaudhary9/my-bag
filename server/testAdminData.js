const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const adminService = require("./src/services/adminService");

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");
    
    const stats = await adminService.getStats();
    console.log("Stats:", JSON.stringify(stats, null, 2));

    const orders = await adminService.listOrders();
    console.log("Orders count:", orders.orders.length);
    if (orders.orders.length > 0) {
      console.log("First Order:", JSON.stringify(orders.orders[0], null, 2));
    }

    const customers = await adminService.listCustomers();
    console.log("Customers count:", customers.length);
    if (customers.length > 0) {
      console.log("First Customer:", JSON.stringify(customers[0], null, 2));
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.connection.close();
  }
}

run();
