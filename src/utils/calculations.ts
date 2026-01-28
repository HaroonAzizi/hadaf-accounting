export type Transaction = {
  amount: number | string;
  currency: string;
  type: "in" | "out";
};

export function calculateTotal(
  transactions: Transaction[],
  type: "in" | "out",
  currency: string,
) {
  return transactions
    .filter((t) => t.type === type && t.currency === currency)
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

export function groupByCurrency(transactions: Transaction[]) {
  const currencies: Record<string, { income: number; expense: number }> = {};

  for (const t of transactions) {
    if (!currencies[t.currency])
      currencies[t.currency] = { income: 0, expense: 0 };

    if (t.type === "in") currencies[t.currency].income += Number(t.amount);
    else currencies[t.currency].expense += Number(t.amount);
  }

  return currencies;
}
