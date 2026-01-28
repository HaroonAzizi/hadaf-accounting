import { ArrowDownCircle, ArrowUpCircle, Edit2, Trash2 } from "lucide-react";

import type { Transaction } from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/formatters";
import type { CurrencyCode } from "../../utils/constants";

export function TransactionRow({
  transaction,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (id: number) => void;
}) {
  const isIncome = transaction.type === "in";

  return (
    <div className="group p-4 rounded-xl border-2 border-slate-100 hover:border-sky-500/20 hover:shadow-md transition-all">
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
            <h4 className="font-semibold text-lg truncate">
              {transaction.name}
            </h4>
            <p className="text-sm text-slate-500 truncate">
              {(transaction.category_name || "Uncategorized") +
                " • " +
                formatDate(transaction.date)}
            </p>
            {transaction.description ? (
              <p className="text-sm text-slate-500 truncate">
                {transaction.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right">
            <p
              className={`text-2xl font-bold font-display ${
                isIncome ? "text-emerald-500" : "text-red-600"
              }`}
            >
              {isIncome ? "+" : "-"}
              {formatCurrency(
                transaction.amount,
                (transaction.currency as CurrencyCode) || "AFN",
              )}
            </p>
            <p className="text-sm text-slate-500">{transaction.currency}</p>
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(transaction)}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              type="button"
              aria-label="Edit"
            >
              <Edit2 size={18} className="text-blue-600" />
            </button>
            <button
              onClick={() => onDelete(transaction.id)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              type="button"
              aria-label="Delete"
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
