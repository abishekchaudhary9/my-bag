const OTP = require("../models/otpModel");
const createHttpError = require("../utils/httpError");

async function createOtp(email) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await OTP.deleteMany({ email }); // Clear old ones
  const otp = new OTP({ email, code, expires_at: expiresAt });
  await otp.save();
  
  return code;
}

async function verifyOtp(email, code) {
  const otp = await OTP.findOne({ email, code });
  
  if (!otp) {
    throw createHttpError(400, "Invalid verification code.");
  }

  if (otp.expires_at < new Date()) {
    await otp.deleteOne();
    throw createHttpError(400, "Verification code has expired.");
  }

  await otp.deleteOne(); // Use once
  return true;
}

module.exports = {
  createOtp,
  verifyOtp
};
