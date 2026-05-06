export const DEFAULT_COUNTRY = "Nepal";

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function normalizeNepalPhone(value: string) {
  const compact = value.trim().replace(/[\s().-]/g, "");
  if (!compact) return "";

  if (compact.startsWith("+977")) {
    return compact;
  }

  if (compact.startsWith("00977")) {
    return `+977${compact.slice(5)}`;
  }

  if (compact.startsWith("977")) {
    return `+${compact}`;
  }

  return compact;
}

export function isValidNepalPhone(value: string) {
  const normalized = normalizeNepalPhone(value);
  return /^(?:\+977)?9[78]\d{8}$/.test(normalized);
}

export function formatNepalPhone(value: string) {
  const normalized = normalizeNepalPhone(value);
  if (/^9[78]\d{8}$/.test(normalized)) {
    return `+977${normalized}`;
  }
  return normalized;
}
