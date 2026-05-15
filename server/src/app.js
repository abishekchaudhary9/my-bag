// Deployment: 2026-05-09
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const env = require("./config/env");
const { initSocket } = require("./lib/socket");

const { healthCheck, databaseHealthCheck } = require("./controllers/healthController");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);

const defaultOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const rawOrigins = process.env.CLIENT_URL || env.clientUrl || defaultOrigins;
const allowedOrigins = Array.from(new Set([
  ...(Array.isArray(rawOrigins) ? rawOrigins : String(rawOrigins).split(",")),
  ...defaultOrigins,
]))
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Exact match or match with trailing slash to prevent subdomain hijacking
    const isAllowed = !origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o + "/"));
    
    if (isAllowed) {
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
app.use("/api/ai", require("./routes/ai"));

app.get("/api/health", healthCheck);
app.get("/api/health/db", databaseHealthCheck);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || env.port || 5000;

const connectDB = require("./config/database");
const seed = require("./config/seed");

// Initialize and start server
const startServer = async () => {
  try {
    await connectDB();
    // Seed data if needed
    try {
      await seed();
    } catch (seedError) {
      console.warn("Seeding skipped due to database error:", seedError.message);
    }
  } catch (err) {
    console.error("Database connection phase failed:", err.message);
    process.exit(1);
  }

  // Initialize Socket.io
  initSocket(server, allowedOrigins);

  server.listen(PORT, () => {
    console.log(`Maison API server (with Sockets & MongoDB) running on port ${PORT}`);
    console.log("Health: /api/health");
    console.log(`CORS allowed: ${allowedOrigins.join(", ")}`);
  });

  server.on("error", (e) => {
    if (e.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Please kill the process or wait a moment for it to release.`);
      process.exit(1);
    }
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
