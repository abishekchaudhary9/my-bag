import { apiClient } from "./apiClient";

export const productsApi = {
  list: (params?: { category?: string; q?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.q) query.set("q", params.q);
    const qs = query.toString();
    return apiClient.request<{ products: any[] }>(`/products${qs ? `?${qs}` : ""}`);
  },

  get: (slug: string) => apiClient.request<{ product: any }>(`/products/${slug}`),

  create: (data: any) =>
    apiClient.request<{ product: any }>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiClient.request<{ product: any }>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) => apiClient.request<{ message: string }>(`/products/${id}`, { method: "DELETE" }),
};


