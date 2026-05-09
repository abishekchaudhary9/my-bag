export const statusColor: Record<string, string> = {
  processing: "bg-amber-500", 
  shipped: "bg-blue-500", 
  delivered: "bg-emerald-500", 
  cancelled: "bg-red-500",
};

export const statusTone: Record<string, string> = {
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export const chartColors = ["#111827", "#b98f47", "#2563eb", "#059669", "#dc2626", "#7c3aed"];

export type AdminTab = "dashboard" | "products" | "orders" | "customers" | "feedback" | "notifications" | "coupons" | "profile";
