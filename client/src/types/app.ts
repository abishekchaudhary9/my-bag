export type UserRole = "user" | "admin";

export type UserAddress = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

export type User = {
  id: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: UserAddress;
  emailVerified: boolean;
  createdAt: string;
};

export type OrderItem = {
  name: string;
  color: string;
  size: string;
  qty: number;
  price: number;
  image: string;
};

export type Order = {
  id: string;
  date: string;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  trackingNumber?: string;
};

export type CartItem = {
  id?: string | number;
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  qty: number;
};

