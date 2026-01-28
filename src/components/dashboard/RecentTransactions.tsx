import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

import { Card } from "../common/Card";
import { formatCurrency, formatDate } from "../../utils/formatters";
import type { Transaction } from "../../services/api";
import type { CurrencyCode } from "../../utils/constants";

export function RecentTransactions({
  transactions,
  currencyFallback = "AFN",
}: {
  transactions: Transaction[];
  currencyFallback?: CurrencyCode;
}) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold font-display mb-6">
        Recent Transactions
      </h3>

      <div className="space-y-3">
        {transactions.map((t) => {
          const isIncome = t.type === "in";
          return (
            <div
              key={t.id}
              className="group p-4 rounded-xl border-2 border-slate-100 hover:border-sky-500/20 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`p-3 rounded-xl ${
                      isIncome ? "bg-emerald-500/10" : "bg-red-600/10"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpCircle className="text-emerald-500" size={24} />
                    ) : (
                      <ArrowDownCircle className="text-red-600" size={24} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-semibold text-base truncate">
                      {t.name}
                    </h4>
                    <p className="text-sm text-slate-500 truncate">
                      {t.category_name || "Uncategorized"} •{" "}
                      {formatDate(t.date)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`font-bold font-display ${
                      isIncome ? "text-emerald-500" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(
                      t.amount,
                      (t.currency as CurrencyCode) || currencyFallback,
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    {isIncome ? "Income" : "Expense"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
