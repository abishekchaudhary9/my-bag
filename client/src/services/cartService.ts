import { apiClient } from "./apiClient";

export const cartApi = {
  get: () => apiClient.request<{ cart: any[] }>("/cart"),

  add: (productId: string, color: string, size: string, qty?: number) =>
    apiClient.request<{ message: string }>("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, color, size, qty: qty || 1 }),
    }),

  updateQty: (id: number, qty: number) =>
    apiClient.request<{ message: string }>(`/cart/${id}`, {
      method: "PUT",
      body: JSON.stringify({ qty }),
    }),

  remove: (id: number) =>
    apiClient.request<{ message: string }>(`/cart/${id}`, { method: "DELETE" }),

  clear: () => apiClient.request<{ message: string }>("/cart", { method: "DELETE" }),
};


