const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const env = require("../config/env");
const { getFirebaseAuth } = require("../config/firebase");
const createHttpError = require("../utils/httpError");
const { DEFAULT_COUNTRY, formatNepalPhone, isValidEmail, isValidNepalPhone } = require("../utils/validation");
const { emitEvent } = require("../lib/socket");
const { sendEmail } = require("../utils/mailer");
const { loginAlertTemplate, welcomeTemplate } = require("../utils/emailTemplates");

function signToken(user) {
  return jwt.sign(
    { id: user.id || user._id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function firebaseOnlyError() {
  return createHttpError(410, "Password authentication has moved to Firebase.");
}

function parseName(displayName, fallbackFirst = "Maison", fallbackLast = "Customer") {
  const parts = String(displayName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: fallbackFirst, lastName: fallbackLast };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ") || fallbackLast,
  };
}

function phoneProxyEmail(uid) {
  return `phone-${uid}@phone.maison.local`;
}

function isAdminEmail(email) {
  return env.adminEmails.includes(String(email || "").trim().toLowerCase());
}

async function signup() {
  throw firebaseOnlyError();
}

async function login() {
  throw firebaseOnlyError();
}

async function loginWithGoogle() {
  throw firebaseOnlyError();
}

async function loginWithFirebase({ idToken, profile, ip, userAgent }) {
  if (!idToken) {
    throw createHttpError(400, "Firebase ID token is required.");
  }
  profile = profile || {};

  let decoded;
  let firebaseUser;
  try {
    const firebaseAuth = getFirebaseAuth();
    decoded = await firebaseAuth.verifyIdToken(idToken);
    firebaseUser = await firebaseAuth.getUser(decoded.uid);
  } catch (err) {
    console.error("Firebase Verification Error Details:", err);
    throw createHttpError(401, "Firebase sign-in could not be verified.");
  }

  const email = String(decoded.email || firebaseUser.email || "").trim().toLowerCase();
  const dbEmail = email || phoneProxyEmail(decoded.uid);
  const rawPhone = decoded.phone_number || firebaseUser.phoneNumber || profile.phone || "";
  const phone = rawPhone ? formatNepalPhone(rawPhone) : null;
  const avatar = decoded.picture || firebaseUser.photoURL || null;
  const profileName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const firebaseName = decoded.name || firebaseUser.displayName || "";
  const name = parseName(profileName || firebaseName, phone ? "Phone" : "Maison", "Customer");
  const firstName = String(profile.firstName || name.firstName).trim();
  const lastName = String(profile.lastName || name.lastName).trim();
  const role = isAdminEmail(email) ? "admin" : "user";

  if (phone && !isValidNepalPhone(phone)) {
    throw createHttpError(400, "Enter a valid Nepal mobile number.");
  }

  let user = await User.findOne({ 
    $or: [
      { firebase_uid: decoded.uid },
      { email: email || { $exists: false } },
      { phone: phone || { $exists: false } }
    ]
  });

  if (user) {
    const isPhoneAuth = dbEmail.includes("phone.maison.local");
    const isVerified = decoded.email_verified || user.email_verified || isPhoneAuth;

    user.firebase_uid = decoded.uid;
    user.email = email || user.email || dbEmail;
    user.first_name = firstName || user.first_name;
    user.last_name = lastName || user.last_name;
    user.role = role;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    user.email_verified = isVerified;
    
    if (profile.street) user.street = profile.street;
    if (profile.city) user.city = profile.city;
    if (profile.state) user.state = profile.state;
    if (profile.zip) user.zip = profile.zip;
    if (profile.country) user.country = profile.country;

    await user.save();

    // Security Alert
    if (user.email && !user.email.includes("phone.maison.local")) {
      sendEmail({
        to: user.email,
        subject: "Security Alert: New Sign-in to Maison",
        html: loginAlertTemplate({
          name: user.first_name,
          email: user.email,
          ip: ip || "Unknown",
          userAgent: userAgent || "Unknown Device",
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kathmandu" }) + " (NPT)"
        })
      }).catch(err => console.error("Login Alert Email Failed:", err));
    }

    return { user: user.toJSON(), token: signToken(user) };
  }

  // Create new user
  user = new User({
    firebase_uid: decoded.uid,
    email: dbEmail,
    password_hash: `firebase:${decoded.uid}`,
    first_name: firstName,
    last_name: lastName,
    role,
    phone,
    avatar,
    street: profile.street || null,
    city: profile.city || null,
    state: profile.state || null,
    zip: profile.zip || null,
    country: profile.country || null,
    email_verified: decoded.email_verified || false
  });

  await user.save();
  
  // Real-time: Notify admins
  emitEvent("admins", "new_customer", { customerId: user._id, name: `${firstName} ${lastName}` });
  
  // Welcome & Security
  if (user.email && !user.email.includes("phone.maison.local")) {
    sendEmail({
      to: user.email,
      subject: "Welcome to Maison",
      html: welcomeTemplate({ name: user.first_name })
    }).catch(err => console.error("Welcome Email Failed:", err));
  }

  const isPhoneAuth = dbEmail.includes("phone.maison.local");
  const isVerified = user.email_verified || isPhoneAuth;
  const token = isVerified ? signToken(user) : null;
  return { user: user.toJSON(), token };
}

async function findEmailByPhone({ phone }) {
  if (!phone || !isValidNepalPhone(phone)) {
    throw createHttpError(400, "Enter a valid Nepal mobile number.");
  }
  const formattedPhone = formatNepalPhone(phone);
  const user = await User.findOne({ phone: formattedPhone }).select("email");
  
  if (!user || /^phone-[^@]+@phone\.maison\.local$/i.test(user.email)) {
    throw createHttpError(404, "No email account is linked to this phone number.");
  }

  return { email: user.email };
}

async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw createHttpError(404, "User not found");
  }
  return user.toJSON();
}

async function updateProfile(userId, profile) {
  const { firstName, lastName, email, phone, street, city, state, zip, country } = profile;
  const formattedPhone = phone ? formatNepalPhone(phone) : phone;

  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      throw createHttpError(400, "Enter a valid email address.");
    }
    const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } });
    if (existing) {
      throw createHttpError(409, "An account with this email already exists.");
    }
    profile.email = normalizedEmail;
  }

  if (phone && !isValidNepalPhone(phone)) {
    throw createHttpError(400, "Enter a valid Nepal mobile number.");
  }

  const updates = {
    email: profile.email,
    first_name: firstName,
    last_name: lastName,
    phone: formattedPhone,
    street,
    city,
    state,
    zip,
    country: country || DEFAULT_COUNTRY
  };

  // Remove undefined/nulls to avoid overwriting with COALESCE style
  Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

  const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true });
  if (!user) throw createHttpError(404, "User not found");
  
  return user.toJSON();
}

async function updatePassword(userId, { currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    throw createHttpError(400, "Both current and new password required.");
  }
  if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    throw createHttpError(400, "Password must be at least 8 characters and include one uppercase letter and one number.");
  }

  const user = await User.findById(userId).select("password_hash");
  if (!user) throw createHttpError(404, "User not found");

  if (String(user.password_hash || "").startsWith("firebase:")) {
    throw createHttpError(400, "Use Firebase to change this password.");
  }

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) {
    throw createHttpError(401, "Current password is incorrect.");
  }

  const hash = await bcrypt.hash(newPassword, 10);
  user.password_hash = hash;
  await user.save();
  
  return { message: "Password updated successfully." };
}

async function updateAvatar(userId, avatarUrl) {
  const user = await User.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true });
  if (!user) throw createHttpError(404, "User not found");
  return user.toJSON();
}

module.exports = {
  signup,
  login,
  loginWithGoogle,
  loginWithFirebase,
  findEmailByPhone,
  getCurrentUser,
  updateProfile,
  updatePassword,
  updateAvatar,
};
