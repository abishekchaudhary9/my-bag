const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is required. Set it in the deployment environment.");
  }

  try {
    mongoose.set("bufferCommands", false);

    const conn = await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const message = error?.message || String(error);
    console.error(`MongoDB connection failed: ${message}`);
    console.log(`MongoDB connection failed: ${message}`);
    throw error;
  }
};

module.exports = connectDB;
