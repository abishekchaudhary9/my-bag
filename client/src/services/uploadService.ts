import { apiClient } from "./apiClient";

export const uploadsApi = {
  image: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.uploadRequest<{ image: { url: string; publicId: string } }>("/uploads/image", formData);
  },

  avatar: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.uploadRequest<{ user: any; image: { url: string; publicId: string } }>("/uploads/avatar", formData);
  },

  deleteAvatar: () => apiClient.request<{ user: any }>("/uploads/avatar", { method: "DELETE" }),
};


