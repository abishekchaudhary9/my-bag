const DEFAULT_API_BASE = "http://localhost:5000/api";

function normalizeApiBase(value?: string) {
  const base = (value || DEFAULT_API_BASE).trim().replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

export function resolveAssetUrl(value?: string | null) {
  if (!value) return "";
  const trimmed = value.trim();
  const apiBase = normalizeApiBase(import.meta.env.VITE_API_URL);
  const assetBase = apiBase.replace(/\/api$/, "");

  if (/^(https?:)?\/\//i.test(trimmed) || /^(data|blob):/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/images/")) {
    return `${assetBase}${trimmed}`;
  }

  if (trimmed.includes("@")) {
    return trimmed;
  }

  const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
  const hasImageExtension = imageExtensions.some((ext) => trimmed.toLowerCase().endsWith(ext));

  if (!trimmed.startsWith("/") && hasImageExtension) {
    return `${assetBase}/images/${trimmed}`;
  }

  return trimmed;
}

