const DEFAULT_COUNTRY = "Nepal";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function normalizeNepalPhone(value) {
  const compact = String(value || "").trim().replace(/[\s().-]/g, "");
  if (!compact) return "";

  if (compact.startsWith("+977")) return compact;
  if (compact.startsWith("00977")) return `+977${compact.slice(5)}`;
  if (compact.startsWith("977")) return `+${compact}`;

  return compact;
}

function isValidNepalPhone(value) {
  const normalized = normalizeNepalPhone(value);
  return /^(?:\+977)?9[678]\d{8}$/.test(normalized);
}

function formatNepalPhone(value) {
  const normalized = normalizeNepalPhone(value);
  if (/^9[678]\d{8}$/.test(normalized)) {
    return `+977${normalized}`;
  }
  return normalized;
}

module.exports = {
  DEFAULT_COUNTRY,
  formatNepalPhone,
  isValidEmail,
  isValidNepalPhone,
  normalizeNepalPhone,
};
