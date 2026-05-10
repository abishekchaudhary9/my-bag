import { apiClient } from "./apiClient";

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  firebaseLogin: (
    idToken: string,
    profile?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    }
  ) =>
    apiClient.request<{ user: any; token: string }>("/auth/firebase", {
      method: "POST",
      body: JSON.stringify({ idToken, profile }),
    }),

  googleLogin: (credential: string) =>
    apiClient.request<{ user: any; token: string }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),

  signup: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    apiClient.request<{ user: any; token: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => apiClient.request<{ user: any }>("/auth/me"),

  updateProfile: (updates: Record<string, any>) =>
    apiClient.request<{ user: any }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.request<{ message: string }>("/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  findEmailByPhone: (phone: string) =>
    apiClient.request<{ email: string }>("/auth/phone/email", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  sendOtp: (email: string) =>
    apiClient.request<{ message: string }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email: string, code: string) =>
    apiClient.request<{ success: boolean; message: string }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    }),

  notifications: () => apiClient.request<{ notifications: any[] }>("/notifications"),

  markNotificationsRead: () =>
    apiClient.request<{ message: string }>("/notifications/read-all", {
      method: "PUT",
    }),
};


