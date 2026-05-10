import { apiClient } from "./apiClient";

export const adminApi = {
  stats: () => apiClient.request<{ stats: any }>("/admin/stats"),
  orders: (status?: string) => {
    const qs = status ? `?status=${status}` : "";
    return apiClient.request<{ orders: any[] }>(`/admin/orders${qs}`);
  },
  orderDetails: (orderNumber: string) =>
    apiClient.request<{ order: any }>(`/admin/orders/${orderNumber}/details`),
  updateOrder: (orderNumber: string, data: any) =>
    apiClient.request<{ message: string }>(`/admin/orders/${orderNumber}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  customers: () => apiClient.request<{ customers: any[] }>("/admin/customers"),
  messages: () => apiClient.request<{ messages: any[] }>("/admin/messages"),
  feedback: () => apiClient.request<{ reviews: any[]; questions: any[] }>("/admin/feedback"),
  notifications: () => apiClient.request<{ notifications: any[] }>("/admin/notifications"),
  sendNotification: (data: { userId: number; title: string; message: string; link?: string }) =>
    apiClient.request<{ message: string }>("/admin/notifications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  coupons: () => apiClient.request<{ coupons: any[] }>("/admin/coupons"),
  createCoupon: (data: { code: string; discount_pct: number; active: boolean; description?: string; terms?: string }) =>
    apiClient.request<{ message: string }>("/admin/coupons", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteCoupon: (id: number) =>
    apiClient.request<{ message: string }>(`/admin/coupons/${id}`, { method: "DELETE" }),
};


