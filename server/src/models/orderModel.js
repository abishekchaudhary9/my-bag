const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  color: { type: String },
  size: { type: String },
  qty: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  image: { type: String }
});

const orderSchema = new mongoose.Schema({
  order_number: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { 
    type: String, 
    enum: ["payment_pending", "processing", "shipped", "delivered", "cancelled"], 
    default: "processing" 
  },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  tracking_number: { type: String },
  shipping_address: {
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    phone: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    municipality: { type: String },
    ward: { type: String },
    zip: { type: String },
    country: { type: String },
    lat: { type: Number },
    lng: { type: Number }
  },
  payment_method: { type: String, default: "card" },
  payment_status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  items: [orderItemSchema],
  created_at: { type: Date, default: Date.now }
});

orderSchema.methods.toJSON = function() {
  const obj = this.toObject();
  return {
    id: String(obj._id),
    orderNumber: obj.order_number,
    userId: String(obj.user),
    status: obj.status,
    subtotal: obj.subtotal,
    shipping: obj.shipping,
    discount: obj.discount,
    total: obj.total,
    trackingNumber: obj.tracking_number,
    shippingAddress: {
      firstName: obj.shipping_address?.first_name,
      lastName: obj.shipping_address?.last_name,
      email: obj.shipping_address?.email,
      phone: obj.shipping_address?.phone,
      street: obj.shipping_address?.street,
      city: obj.shipping_address?.city,
      state: obj.shipping_address?.state,
      municipality: obj.shipping_address?.municipality,
      ward: obj.shipping_address?.ward,
      zip: obj.shipping_address?.zip,
      country: obj.shipping_address?.country,
      coordinates: {
        lat: obj.shipping_address?.lat,
        lng: obj.shipping_address?.lng
      }
    },
    paymentMethod: obj.payment_method,
    paymentStatus: obj.payment_status,
    items: (obj.items || []).map(item => ({
      name: item.product_name,
      color: item.color,
      size: item.size,
      qty: item.qty,
      price: item.price,
      image: item.image
    })),
    createdAt: obj.created_at
  };
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
