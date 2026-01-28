import { format, parseISO } from "date-fns";

import type { CurrencyCode } from "./constants";

const symbols: Record<CurrencyCode, string> = {
  AFN: "؋",
  USD: "$",
  TRY: "₺",
  EUR: "€",
};

export function formatCurrency(amount: number, currency: CurrencyCode = "AFN") {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return `${symbols[currency]} ${formatted}`;
}

export function formatDate(dateIso: string) {
  return format(parseISO(dateIso), "MMM dd, yyyy");
}

export function formatMonth(dateString: string) {
  return format(parseISO(dateString), "MMMM yyyy");
}
