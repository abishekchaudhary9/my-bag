export const parseCurrency = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const parsed = Number(value.replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatCurrency = (value: number) => `Rs ${Math.round(value).toLocaleString()}`;

export const formatCompact = (value: number) => {
  if (value >= 1000000) return `Rs ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `Rs ${(value / 1000).toFixed(1)}K`;
  return formatCurrency(value);
};

export const getInitials = (name = "") => name
  .split(" ")
  .filter(Boolean)
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

