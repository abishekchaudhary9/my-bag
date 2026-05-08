const pool = require("../config/database");
const createHttpError = require("../utils/httpError");
const { sendEmail } = require("../utils/mailer");
const { getFirebaseAuth } = require("../config/firebase");

async function generateOtp(email) {
  // Generate a random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Delete any existing OTP for this email
  await pool.query("DELETE FROM otp_verifications WHERE email = ?", [email]);

  // Insert new OTP
  await pool.query(
    "INSERT INTO otp_verifications (email, code, expires_at) VALUES (?, ?, ?)",
    [email, code, expiresAt]
  );

  // Send real email
  await sendEmail({
    to: email,
    subject: "Your Maison Verification Code",
    text: `Your verification code is: ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px;">
        <h2 style="color: #111;">Verify your account</h2>
        <p>Use the code below to complete your registration at Maison Bag.</p>
        <div style="font-size: 32px; font-weight: bold; padding: 20px; background: #f9f9f9; text-align: center; letter-spacing: 5px; color: #b98f47;">
          ${code}
        </div>
        <p style="font-size: 12px; color: #888; margin-top: 20px;">
          This code will expire in 10 minutes. If you did not request this code, please ignore this email.
        </p>
      </div>
    `,
  });

  console.log(`[OTP] Verification code for ${email}: ${code}`);
  
  return { message: "Verification code sent to your email." };
}

async function verifyOtp(email, code) {
  const [rows] = await pool.query(
    "SELECT * FROM otp_verifications WHERE email = ? AND code = ? AND expires_at > NOW()",
    [email, code]
  );

  if (rows.length === 0) {
    throw createHttpError(400, "Invalid or expired OTP code.");
  }

  // OTP is valid, mark user as verified in local DB
  await pool.query("UPDATE users SET email_verified = 1 WHERE email = ?", [email]);
  
  // Also mark as verified in Firebase Authentication
  try {
    const firebaseAuth = getFirebaseAuth();
    const fbUser = await firebaseAuth.getUserByEmail(email);
    await firebaseAuth.updateUser(fbUser.uid, { emailVerified: true });
  } catch (err) {
    console.error("Failed to sync verification to Firebase:", err);
    // We don't throw here because the local DB is already updated
  }

  // Clean up
  await pool.query("DELETE FROM otp_verifications WHERE email = ?", [email]);

  return { success: true, message: "Email verified successfully." };
}

module.exports = { generateOtp, verifyOtp };
