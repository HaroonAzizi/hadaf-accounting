export const CURRENCIES = [
  { value: "AFN", label: "AFN - Afghan Afghani", symbol: "؋" },
  { value: "USD", label: "USD - US Dollar", symbol: "$" },
  { value: "TRY", label: "TRY - Turkish Lira", symbol: "₺" },
  { value: "EUR", label: "EUR - Euro", symbol: "€" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["value"];

export const TRANSACTION_TYPES = {
  IN: "in",
  OUT: "out",
} as const;

export const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

export const DEFAULT_CATEGORIES = [
  "Turkish Class",
  "German Class",
  "English Class",
  "Marketing/Ads",
  "General Costs",
  "Other Income",
] as const;
