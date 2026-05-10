import { apiClient } from "./apiClient";

export const aiApi = {
  summarize: (text: string) =>
    apiClient.request<{ success: boolean; summary: string }>("/ai/summarize", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  generateDescription: (name: string, features?: string) =>
    apiClient.request<{ success: boolean; description: string }>("/ai/generate-description", {
      method: "POST",
      body: JSON.stringify({ name, features }),
    }),

  draftReply: (text: string, sentiment?: string) =>
    apiClient.request<{ success: boolean; reply: string }>("/ai/draft-reply", {
      method: "POST",
      body: JSON.stringify({ text, sentiment }),
    }),

  analyzeSentiment: (text: string) =>
    apiClient.request<{ success: boolean; sentiment: string; score: number }>("/ai/analyze-sentiment", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  concierge: (message: string, history: any[] = []) =>
    apiClient.request<{ success: boolean; reply: string }>("/ai/concierge", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),

  visualSearch: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return fetch(`${import.meta.env.VITE_API_URL}/ai/visual-search`, {
      method: "POST",
      body: formData,
    }).then(res => res.json()) as Promise<{ success: boolean; recommended: any[]; analysis: string }>;
  }
};


