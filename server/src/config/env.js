const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../../.env"), override: true });

function parseNumber(value, fallback) {
  const parsed = parseInt(value || "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDatabaseUrl(rawUrl) {
  if (!rawUrl) return {};

  const url = new URL(rawUrl);
  return {
    host: url.hostname,
    port: parseNumber(url.port, 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    name: decodeURIComponent(url.pathname.replace(/^\//, "")),
  };
}

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function parseJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

const databaseUrl =
  process.env.MYSQL_PUBLIC_URL ||
  process.env.DATABASE_PUBLIC_URL ||
  process.env.MYSQL_URL ||
  process.env.DATABASE_URL;

const databaseFromUrl = parseDatabaseUrl(databaseUrl);
const database = {
  host: databaseFromUrl.host || process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  port: parseNumber(databaseFromUrl.port || process.env.MYSQLPORT || process.env.DB_PORT, 3306),
  user: databaseFromUrl.user || process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: databaseFromUrl.password || process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
  name: databaseFromUrl.name || process.env.MYSQLDATABASE || process.env.DB_NAME || "maison_db",
  connectTimeout: parseNumber(process.env.DB_CONNECT_TIMEOUT, 10000),
};

const firebaseServiceAccount = parseJson(process.env.FIREBASE_SERVICE_ACCOUNT);

module.exports = {
  port: process.env.PORT || 5000,
  clientUrl: parseList(process.env.CLIENT_URL || "http://localhost:8080, http://127.0.0.1:8080"),
  jwtSecret: process.env.JWT_SECRET || "fallback_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  googleClientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "",
  adminEmails: parseList(process.env.ADMIN_EMAILS || "abishekc441@gmail.com"),
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || firebaseServiceAccount?.project_id || "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || firebaseServiceAccount?.client_email || "",
    privateKey: process.env.FIREBASE_PRIVATE_KEY || firebaseServiceAccount?.private_key || "",
    serviceAccount: firebaseServiceAccount,
  },
  database,
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/maison_db",
};

