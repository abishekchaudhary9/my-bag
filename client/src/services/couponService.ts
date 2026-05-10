import { apiClient } from "./apiClient";

export const couponsApi = {
  validate: (code: string) =>
    apiClient.request<{ coupon: { code: string; pct: number } }>("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  list: () => apiClient.request<{ coupons: { code: string; pct: number; description: string; terms: string }[] }>("/coupons"),
};


