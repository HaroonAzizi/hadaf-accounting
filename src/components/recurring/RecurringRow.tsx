import { Clock, Edit2, Play, Trash2 } from "lucide-react";

import type { RecurringTransaction } from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/formatters";
import type { CurrencyCode } from "../../utils/constants";

export function RecurringRow({
  item,
  categoryName,
  isDue,
  onEdit,
  onDelete,
  onExecute,
}: {
  item: RecurringTransaction;
  categoryName: string;
  isDue: boolean;
  onEdit: (t: RecurringTransaction) => void;
  onDelete: (id: number) => void;
  onExecute: (id: number) => void;
}) {
  const isIncome = item.type === "in";
  const active = item.is_active === 1;

  return (
    <div className="group p-4 rounded-xl border-2 border-slate-100 hover:border-primary/20 hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-lg truncate">{item.name}</h4>
            {isDue ? (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                Due
              </span>
            ) : null}
            {!active ? (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                Inactive
              </span>
            ) : null}
          </div>

          <p className="text-sm text-slate-500 truncate">
            {categoryName} • {item.frequency} • next:{" "}
            {formatDate(item.next_due_date)}
          </p>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right">
            <p
              className={`text-xl font-bold font-display ${
                isIncome ? "text-income" : "text-expense"
              }`}
            >
              {isIncome ? "+" : "-"}
              {formatCurrency(
                item.amount,
                (item.currency as CurrencyCode) || "AFN",
              )}
            </p>
            <p className="text-sm text-slate-500 flex items-center justify-end gap-1">
              <Clock size={14} /> {item.currency}
            </p>
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isDue && active ? (
              <button
                onClick={() => onExecute(item.id)}
                className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                type="button"
                aria-label="Execute"
              >
                <Play size={18} className="text-emerald-600" />
              </button>
            ) : null}
            <button
              onClick={() => onEdit(item)}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              type="button"
              aria-label="Edit"
            >
              <Edit2 size={18} className="text-blue-600" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
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
