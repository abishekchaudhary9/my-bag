import { apiClient } from "./apiClient";

export const wishlistApi = {
  get: () => apiClient.request<{ wishlist: any[]; productIds: string[] }>("/wishlist"),

  toggle: (productId: string) =>
    apiClient.request<{ action: string; message: string }>("/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),

  remove: (productId: string) =>
    apiClient.request<{ message: string }>(`/wishlist/${productId}`, { method: "DELETE" }),
};


