const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firebase_uid: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  phone: { type: String },
  avatar: { type: String },
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zip: { type: String },
  country: { type: String, default: "Nepal" },
  email_verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

// Mapper to maintain same structure as before for frontend
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  const email = String(obj.email || "");
  const isPhoneProxyEmail = /^phone-[^@]+@phone\.maison\.local$/i.test(email);

  return {
    id: String(obj._id),
    email: isPhoneProxyEmail ? "" : email,
    firstName: obj.first_name,
    lastName: obj.last_name,
    role: obj.role,
    phone: obj.phone,
    avatar: obj.avatar,
    address: obj.street
      ? {
          street: obj.street,
          city: obj.city,
          state: obj.state,
          zip: obj.zip,
          country: obj.country,
        }
      : undefined,
    emailVerified: obj.email_verified,
    createdAt: obj.created_at,
  };
};

const User = mongoose.model("User", userSchema);

module.exports = User;
