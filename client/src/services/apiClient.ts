import { resolveAssetUrl } from "@/utils/asset";

const DEFAULT_API_BASE = "http://localhost:5000/api";

function normalizeApiBase(value?: string) {
  const base = (value || DEFAULT_API_BASE).trim().replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);
const ASSET_BASE = API_BASE.replace(/\/api$/, "");

function getToken(): string | null {
  try {
    return localStorage.getItem("maison.token");
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem("maison.token", token);
  } else {
    localStorage.removeItem("maison.token");
  }
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  statusCode: number;
  error?: string;
  timestamp: string;
}

function parseResponse<T>(res: Response, text: string) {
  let apiResponse: ApiResponse<T> | any = null;
  try {
    apiResponse = text ? JSON.parse(text) : null;
  } catch {
    apiResponse = { error: text };
  }

  if (!res.ok) {
    const errorMessage = apiResponse?.message || apiResponse?.error || `Request failed with status ${res.status}`;
    throw new Error(errorMessage);
  }

  // Handle standardized response format
  if (apiResponse?.success === false) {
    throw new Error(apiResponse?.message || "Request failed");
  }

  // Return the data field if it exists (new format), otherwise return the whole response (backward compatibility)
  const data = apiResponse?.data ?? apiResponse;
  return normalizeAssetUrls(data) as T;
}

function normalizeAssetUrls<T>(value: T): T {
  if (typeof value === "string") {
    return resolveAssetUrl(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeAssetUrls(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeAssetUrls(item)])
    ) as T;
  }

  return value;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  return parseResponse<T>(res, text);
}

export async function uploadRequest<T>(endpoint: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const text = await res.text();
  return parseResponse<T>(res, text);
}

export type ApiClient = {
  request: <T>(endpoint: string, options?: RequestInit) => Promise<T>;
  uploadRequest: <T>(endpoint: string, formData: FormData) => Promise<T>;
  setToken: (token: string | null) => void;
};

export const apiClient: ApiClient = {
  request,
  uploadRequest,
  setToken,
};
