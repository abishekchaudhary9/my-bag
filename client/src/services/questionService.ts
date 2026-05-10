import { apiClient } from "./apiClient";

export const questionsApi = {
  get: (productId: string) =>
    apiClient.request<{ questions: any[]; count: number }>(`/questions/${productId}`),

  submit: (productId: string, data: { text: string }) =>
    apiClient.request<{ message: string }>(`/questions/${productId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  answer: (questionId: number, data: { answer: string }) =>
    apiClient.request<{ message: string }>(`/questions/${questionId}/answer`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  edit: (questionId: number, data: { text: string }) =>
    apiClient.request<{ message: string }>(`/questions/${questionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (questionId: number) =>
    apiClient.request<{ message: string }>(`/questions/${questionId}`, { method: "DELETE" }),
};


