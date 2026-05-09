const mongoose = require("mongoose");

function healthCheck(req, res) {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
}

async function databaseHealthCheck(req, res) {
  try {
    const status = mongoose.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    res.json({
      status: status === 1 ? "ok" : "warning",
      database: "mongodb",
      connection: states[status],
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "unavailable",
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = { healthCheck, databaseHealthCheck };
