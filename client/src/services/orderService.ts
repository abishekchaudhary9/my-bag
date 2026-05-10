import { apiClient } from "./apiClient";

export const ordersApi = {
  create: (data: any) =>
    apiClient.request<{ order: any }>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  khaltiInitiate: (data: any) =>
    apiClient.request<{ pidx: string; payment_url: string }>("/orders/khalti-initiate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: () => apiClient.request<{ orders: any[] }>("/orders"),

  get: (orderNumber: string) => apiClient.request<{ order: any }>(`/orders/${orderNumber}`),
  verifyPayment: (orderId: string, pidx: string, method: string) => 
    apiClient.request<{ success: boolean; message: string }>("/orders/verify-payment", {
      method: "POST",
      body: JSON.stringify({ orderId, pidx, method }),
    }),
};


