import { apiClient } from "./apiClient";

export const aiApi = {
  summarize: (text: string) =>
    apiClient.request<{ success: boolean; summary: string }>("/ai/summarize", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  searchAssistant: (query: string, categories?: string[]) =>
    apiClient.request<{ success: boolean; suggestions: string }>("/ai/search-assistant", {
      method: "POST",
      body: JSON.stringify({ query, categories }),
    }),
};


