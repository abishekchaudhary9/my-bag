const OTP = require("../models/otpModel");
const User = require("../models/userModel");
const createHttpError = require("../utils/httpError");
const { sendEmail } = require("../utils/mailer");
const { isValidEmail } = require("../utils/validation");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function otpTemplate(code) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
      <h2 style="font-weight: 400; letter-spacing: 2px;">MAISON</h2>
      <p>Your verification code is:</p>
      <div style="font-size: 32px; letter-spacing: 8px; font-weight: 700; margin: 24px 0;">${code}</div>
      <p style="color: #666;">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
    </div>
  `;
}

async function createOtp(email) {
  email = normalizeEmail(email);
  if (!isValidEmail(email)) {
    throw createHttpError(400, "Enter a valid email address.");
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await OTP.deleteMany({ email }); // Clear old ones
  const otp = new OTP({ email, code, expires_at: expiresAt });
  await otp.save();
  
  return code;
}

async function generateOtp(email) {
  email = normalizeEmail(email);
  const code = await createOtp(email);

  await sendEmail({
    to: email,
    subject: "Your Maison verification code",
    text: `Your Maison verification code is ${code}. It expires in 10 minutes.`,
    html: otpTemplate(code),
  });

  return { message: "OTP sent to email" };
}

async function verifyOtp(email, code) {
  email = normalizeEmail(email);
  if (!isValidEmail(email)) {
    throw createHttpError(400, "Enter a valid email address.");
  }

  const otp = await OTP.findOne({ email, code });
  
  if (!otp) {
    throw createHttpError(400, "Invalid verification code.");
  }

  if (otp.expires_at < new Date()) {
    await otp.deleteOne();
    throw createHttpError(400, "Verification code has expired.");
  }

  await otp.deleteOne(); // Use once

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { email_verified: true } },
    { new: true }
  );

  if (!user) {
    throw createHttpError(404, "No account was found for this email address.");
  }

  return { success: true, message: "Email verified successfully." };
}

module.exports = {
  createOtp,
  generateOtp,
  verifyOtp
};
