import { apiClient } from "./apiClient";

export const contactApi = {
  send: (data: { name: string; email: string; subject: string; message: string }) =>
    apiClient.request<{ message: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};


