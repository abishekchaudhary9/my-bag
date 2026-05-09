/**
 * Central API client for communicating with the Maison backend.
 * All API calls go through here for consistent error handling and auth headers.
 */

const DEFAULT_API_BASE = "http://localhost:5000/api";

function normalizeApiBase(value?: string) {
  const base = (value || DEFAULT_API_BASE).trim().replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);
console.log("[Maison API] Base URL:", API_BASE);
const ASSET_BASE = API_BASE.replace(/\/api$/, "");

export function resolveAssetUrl(value?: string | null) {
  if (!value) return "";
  const trimmed = value.trim();

  if (/^(https?:)?\/\//i.test(trimmed) || /^(data|blob):/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/images/")) {
    return `${ASSET_BASE}${trimmed}`;
  }

  // If it contains an '@', it's likely an email address. Never transform emails.
  if (trimmed.includes("@")) {
    return trimmed;
  }

  // Only transform if it looks like an image file (has an extension like .jpg, .png, etc.)
  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
  const hasImageExtension = imageExtensions.some(ext => trimmed.toLowerCase().endsWith(ext));

  if (!trimmed.startsWith("/") && hasImageExtension) {
    return `${ASSET_BASE}/images/${trimmed}`;
  }

  return trimmed;
}

function normalizeAssetUrls<T>(value: T): T {
  if (typeof value === "string") {
    return resolveAssetUrl(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeAssetUrls(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeAssetUrls(item)])
    ) as T;
  }

  return value;
}

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("maison.token");
    return raw || null;
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem("maison.token", token);
  } else {
    localStorage.removeItem("maison.token");
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text };
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return normalizeAssetUrls(data) as T;
}

async function uploadRequest<T>(endpoint: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const text = await res.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text };
  }

  if (!res.ok) {
    throw new Error(data?.error || `Upload failed with status ${res.status}`);
  }

  return normalizeAssetUrls(data) as T;
}

// ─── Auth ────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  firebaseLogin: (
    idToken: string, 
    profile?: { 
      firstName?: string; 
      lastName?: string; 
      phone?: string;
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    }
  ) =>
    request<{ user: any; token: string }>("/auth/firebase", {
      method: "POST",
      body: JSON.stringify({ idToken, profile }),
    }),

  googleLogin: (credential: string) =>
    request<{ user: any; token: string }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),

  signup: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    request<{ user: any; token: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => request<{ user: any }>("/auth/me"),

  updateProfile: (updates: Record<string, any>) =>
    request<{ user: any }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>("/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  findEmailByPhone: (phone: string) =>
    request<{ email: string }>("/auth/phone/email", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),
  
  sendOtp: (email: string) =>
    request<{ message: string }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email: string, code: string) =>
    request<{ success: boolean; message: string }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    }),

  notifications: () => request<{ notifications: any[] }>("/notifications"),

  markNotificationsRead: () =>
    request<{ message: string }>("/notifications/read-all", {
      method: "PUT",
    }),
};

// ─── Products ────────────────────────────────────────────────
export const productsApi = {
  list: (params?: { category?: string; q?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.q) query.set("q", params.q);
    const qs = query.toString();
    return request<{ products: any[] }>(`/products${qs ? `?${qs}` : ""}`);
  },

  get: (slug: string) => request<{ product: any }>(`/products/${slug}`),

  create: (data: any) =>
    request<{ product: any }>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request<{ product: any }>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/products/${id}`, { method: "DELETE" }),
};

// ─── Orders ──────────────────────────────────────────────────
export const uploadsApi = {
  image: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return uploadRequest<{ image: { url: string; publicId: string } }>("/uploads/image", formData);
  },
};

export const ordersApi = {
  create: (data: any) =>
    request<{ order: any }>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  khaltiInitiate: (data: any) =>
    request<{ pidx: string; payment_url: string }>("/orders/khalti-initiate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: () => request<{ orders: any[] }>("/orders"),

  get: (orderNumber: string) => request<{ order: any }>(`/orders/${orderNumber}`),
};

// ─── Cart ────────────────────────────────────────────────────
export const cartApi = {
  get: () => request<{ cart: any[] }>("/cart"),

  add: (productId: string, color: string, size: string, qty?: number) =>
    request<{ message: string }>("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, color, size, qty: qty || 1 }),
    }),

  updateQty: (id: number, qty: number) =>
    request<{ message: string }>(`/cart/${id}`, {
      method: "PUT",
      body: JSON.stringify({ qty }),
    }),

  remove: (id: number) =>
    request<{ message: string }>(`/cart/${id}`, { method: "DELETE" }),

  clear: () => request<{ message: string }>("/cart", { method: "DELETE" }),
};

// ─── Wishlist ────────────────────────────────────────────────
export const wishlistApi = {
  get: () => request<{ wishlist: any[]; productIds: string[] }>("/wishlist"),

  toggle: (productId: string) =>
    request<{ action: string; message: string }>("/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),

  remove: (productId: string) =>
    request<{ message: string }>(`/wishlist/${productId}`, { method: "DELETE" }),
};

// ─── Coupons ─────────────────────────────────────────────────
export const couponsApi = {
  validate: (code: string) =>
    request<{ coupon: { code: string; pct: number } }>("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  list: () =>
    request<{ coupons: { code: string; pct: number; description: string; terms: string }[] }>("/coupons"),
};

// ─── Contact ─────────────────────────────────────────────────
export const contactApi = {
  send: (data: { name: string; email: string; subject: string; message: string }) =>
    request<{ message: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Reviews ─────────────────────────────────────────────────
export const reviewsApi = {
  get: (productId: string) =>
    request<{ reviews: any[]; average: number; count: number }>(`/reviews/${productId}`),

  checkEligibility: (productId: string) =>
    request<{ eligible: boolean; reason: string | null }>(`/reviews/${productId}/eligibility`),

  submit: (productId: string, data: { rating: number; title: string; body: string }) =>
    request<{ message: string }>(`/reviews/${productId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  reply: (reviewId: number, data: { reply: string }) =>
    request<{ message: string }>(`/reviews/${reviewId}/reply`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  edit: (reviewId: number, data: { rating: number; title: string; body: string }) =>
    request<{ message: string }>(`/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (reviewId: number) =>
    request<{ message: string }>(`/reviews/${reviewId}`, { method: "DELETE" }),
};

// ─── Questions ───────────────────────────────────────────────
export const questionsApi = {
  get: (productId: string) =>
    request<{ questions: any[]; count: number }>(`/questions/${productId}`),

  submit: (productId: string, data: { text: string }) =>
    request<{ message: string }>(`/questions/${productId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  answer: (questionId: number, data: { answer: string }) =>
    request<{ message: string }>(`/questions/${questionId}/answer`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  edit: (questionId: number, data: { text: string }) =>
    request<{ message: string }>(`/questions/${questionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (questionId: number) =>
    request<{ message: string }>(`/questions/${questionId}`, { method: "DELETE" }),
};

// ─── Notifications ───────────────────────────────────────────
export const notificationsApi = {
  get: () => request<{ notifications: any[] }>("/notifications"),
  markRead: (id: number) =>
    request<{ message: string }>(`/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: () =>
    request<{ message: string }>("/notifications/read-all", { method: "PUT" }),
  delete: (id: number) =>
    request<{ message: string }>(`/notifications/${id}`, { method: "DELETE" }),
  clearAll: () =>
    request<{ message: string }>("/notifications/clear-all", { method: "DELETE" }),
};

// ─── Admin ───────────────────────────────────────────────────
export const adminApi = {
  stats: () => request<{ stats: any }>("/admin/stats"),
  orders: (status?: string) => {
    const qs = status ? `?status=${status}` : "";
    return request<{ orders: any[] }>(`/admin/orders${qs}`);
  },
  orderDetails: (orderNumber: string) =>
    request<{ order: any }>(`/admin/orders/${orderNumber}/details`),
  updateOrder: (orderNumber: string, data: any) =>
    request<{ message: string }>(`/admin/orders/${orderNumber}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  customers: () => request<{ customers: any[] }>("/admin/customers"),
  messages: () => request<{ messages: any[] }>("/admin/messages"),
  feedback: () => request<{ reviews: any[], questions: any[] }>("/admin/feedback"),
  notifications: () => request<{ notifications: any[] }>("/admin/notifications"),
  sendNotification: (data: { userId: number, title: string, message: string, link?: string }) =>
    request<{ message: string }>("/admin/notifications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  coupons: () => request<{ coupons: any[] }>("/admin/coupons"),
  createCoupon: (data: { code: string, discount_pct: number, active: boolean, description?: string, terms?: string }) =>
    request<{ message: string }>("/admin/coupons", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteCoupon: (id: number) =>
    request<{ message: string }>(`/admin/coupons/${id}`, { method: "DELETE" }),
};
