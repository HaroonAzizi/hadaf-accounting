import type { CurrencyTotals, TransactionType } from "../types";

export type TransactionRow = {
  id: number;
  category_id: number;
  category_name?: string;
  amount: number;
  currency: string;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  name: string;
  description?: string | null;
};

export function sumByCurrency(
  rows: Array<{ amount: number; currency: string }>,
): CurrencyTotals {
  return rows.reduce<CurrencyTotals>((acc, row) => {
    acc[row.currency] = (acc[row.currency] ?? 0) + row.amount;
    return acc;
  }, {});
}

export function groupByCurrency(
  amounts: Array<{ amount: number; currency: string }>,
) {
  return sumByCurrency(amounts);
}

export function calculateTotalByCurrency(
  transactions: Array<{ amount: number; currency: string }>,
) {
  return sumByCurrency(transactions);
}

export function groupProfitByCategory(rows: TransactionRow[]) {
  const byCategory = new Map<
    number,
    {
      categoryId: number;
      categoryName: string;
      income: CurrencyTotals;
      expenses: CurrencyTotals;
      profit: CurrencyTotals;
    }
  >();

  for (const row of rows) {
    const existing = byCategory.get(row.category_id) ?? {
      categoryId: row.category_id,
      categoryName: row.category_name ?? String(row.category_id),
      income: {},
      expenses: {},
      profit: {},
    };

    const bucket = row.type === "in" ? existing.income : existing.expenses;
    bucket[row.currency] = (bucket[row.currency] ?? 0) + row.amount;

    byCategory.set(row.category_id, existing);
  }

  for (const item of byCategory.values()) {
    const currencies = new Set([
      ...Object.keys(item.income),
      ...Object.keys(item.expenses),
    ]);
    for (const c of currencies) {
      item.profit[c] = (item.income[c] ?? 0) - (item.expenses[c] ?? 0);
    }
  }

  return Array.from(byCategory.values()).sort((a, b) =>
    a.categoryName.localeCompare(b.categoryName),
  );
}

export function calculateProfitByCategory(transactions: TransactionRow[]) {
  return groupProfitByCategory(transactions);
}

export function groupMonthlyBreakdown(rows: TransactionRow[]) {
  const byMonth = new Map<
    string,
    {
      month: string;
      income: CurrencyTotals;
      expenses: CurrencyTotals;
      profit: CurrencyTotals;
    }
  >();

  for (const row of rows) {
    const month = row.date.slice(0, 7); // YYYY-MM
    const existing = byMonth.get(month) ?? {
      month,
      income: {},
      expenses: {},
      profit: {},
    };
    const bucket = row.type === "in" ? existing.income : existing.expenses;
    bucket[row.currency] = (bucket[row.currency] ?? 0) + row.amount;
    byMonth.set(month, existing);
  }

  for (const item of byMonth.values()) {
    const currencies = new Set([
      ...Object.keys(item.income),
      ...Object.keys(item.expenses),
    ]);
    for (const c of currencies) {
      item.profit[c] = (item.income[c] ?? 0) - (item.expenses[c] ?? 0);
    }
  }

  return Array.from(byMonth.values()).sort((a, b) =>
    a.month.localeCompare(b.month),
  );
}

export function calculateMonthlyBreakdown(transactions: TransactionRow[]) {
  return groupMonthlyBreakdown(transactions);
}
