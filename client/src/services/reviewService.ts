import { apiClient } from "./apiClient";

export const reviewsApi = {
  get: (productId: string) =>
    apiClient.request<{ reviews: any[]; average: number; count: number }>(`/reviews/${productId}`),

  checkEligibility: (productId: string) =>
    apiClient.request<{ eligible: boolean; reason: string | null }>(`/reviews/${productId}/eligibility`),

  submit: (productId: string, data: { rating: number; title: string; body: string }) =>
    apiClient.request<{ message: string }>(`/reviews/${productId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  reply: (reviewId: number, data: { reply: string }) =>
    apiClient.request<{ message: string }>(`/reviews/${reviewId}/reply`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  edit: (reviewId: number, data: { rating: number; title: string; body: string }) =>
    apiClient.request<{ message: string }>(`/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (reviewId: number) =>
    apiClient.request<{ message: string }>(`/reviews/${reviewId}`, { method: "DELETE" }),
};


