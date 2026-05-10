import { apiClient } from "./apiClient";

export const notificationsApi = {
  get: () => apiClient.request<{ notifications: any[] }>("/notifications"),
  markRead: (id: string | number) =>
    apiClient.request<{ message: string }>(`/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: () =>
    apiClient.request<{ message: string }>("/notifications/read-all", { method: "PUT" }),
  delete: (id: string | number) =>
    apiClient.request<{ message: string }>(`/notifications/${id}`, { method: "DELETE" }),
  clearAll: () =>
    apiClient.request<{ message: string }>("/notifications/clear-all", { method: "DELETE" }),
};


