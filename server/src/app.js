const express = require("express");
const cors = require("cors");
const path = require("path");
const env = require("./config/env");
const initDatabase = require("./config/initDatabase");
const { healthCheck, databaseHealthCheck } = require("./controllers/healthController");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || env.clientUrl || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // If no origin (like mobile apps or curl) or it's in the allowed list, permit it
    if (!origin || allowedOrigins.some(o => origin.startsWith(o)) || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS request blocked from origin: ${origin}`);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static(path.join(__dirname, "../public/images")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/uploads", require("./routes/uploads"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/questions", require("./routes/questions"));
app.use("/api/notifications", require("./routes/notifications"));

app.get("/api/health", healthCheck);
app.get("/api/health/db", databaseHealthCheck);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || env.port || 5000;

if (require.main === module) {
  initDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Maison API server running on port ${PORT}`);
        console.log("Health: /api/health");
        console.log(`CORS allowed: ${allowedOrigins.join(", ")}`);
      });
    })
    .catch((err) => {
      console.error("Server startup failed:", err.message);
      process.exit(1);
    });
}

module.exports = app;
