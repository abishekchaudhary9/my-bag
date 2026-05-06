const express = require("express");
const cors = require("cors");
const path = require("path");
const env = require("./config/env");
const { healthCheck } = require("./controllers/healthController");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// ✅ CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || env.clientUrl || "http://localhost:5173",
  credentials: true,
}));

// ✅ Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Static files
app.use("/images", express.static(path.join(__dirname, "../public/images")));

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/questions", require("./routes/questions"));
app.use("/api/notifications", require("./routes/notifications"));

// ✅ Health check
app.get("/api/health", healthCheck);

// ✅ Error handlers
app.use(notFound);
app.use(errorHandler);

// ✅ FIXED: PORT handling for Render
const PORT = process.env.PORT || env.port || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Maison API server running on port ${PORT}`);
    console.log(`Health: /api/health`);
    console.log(`CORS allowed: ${process.env.CLIENT_URL || env.clientUrl}`);
  });
}

module.exports = app;