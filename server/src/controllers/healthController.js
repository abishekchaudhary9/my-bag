const pool = require("../config/database");

function healthCheck(req, res) {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
}

async function databaseHealthCheck(req, res) {
  try {
    await pool.query("SELECT 1");
    const [usersTable] = await pool.query("SHOW TABLES LIKE 'users'");
    const [productsTable] = await pool.query("SHOW TABLES LIKE 'products'");

    res.json({
      status: "ok",
      database: "connected",
      tables: {
        users: usersTable.length > 0,
        products: productsTable.length > 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "unavailable",
      code: err.code || "UNKNOWN",
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = { healthCheck, databaseHealthCheck };
