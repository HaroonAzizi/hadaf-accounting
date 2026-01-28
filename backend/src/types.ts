export type CurrencyCode = "AFN" | "USD" | "TRY" | "EUR";

export type TransactionType = "in" | "out";

export type TransactionStatus = "pending" | "done" | "cancelled";

export type Frequency = "daily" | "weekly" | "monthly" | "yearly";

export type CurrencyTotals = Record<string, number>;
