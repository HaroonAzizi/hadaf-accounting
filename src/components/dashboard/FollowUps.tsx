import { CheckCircle2, XCircle } from "lucide-react";

import type { Transaction } from "../../services/api";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { formatCurrency, formatDate } from "../../utils/formatters";
import type { CurrencyCode } from "../../utils/constants";

export function FollowUps({
  items,
  onMarkDone,
  onCancel,
  busyIds,
}: {
  items: Transaction[];
  onMarkDone: (id: number) => void;
  onCancel: (id: number) => void;
  busyIds?: Set<number>;
}) {
  const startOfToday = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  const daysUntil = (isoDate: string) => {
    const due = new Date(`${isoDate}T00:00:00`);
    const today = startOfToday();
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((due.getTime() - today.getTime()) / msPerDay);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold">Follow-ups</h3>
          <p className="text-sm text-slate-500">
            Pending recurring payments that need action.
          </p>
        </div>
        <span className="text-sm font-medium text-slate-600">
          {items.length} pending
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-slate-500">No follow-ups found.</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((t) => {
            const isBusy = busyIds?.has(t.id) ?? false;
            const isIncome = t.type === "in";
            const isRecurring = Boolean(t.recurring_id);
            const dueInDays = isRecurring ? daysUntil(t.date) : null;
            const showDueSoon =
              isRecurring &&
              dueInDays !== null &&
              dueInDays >= 0 &&
              dueInDays <= 3;
            const dueSoonLabel = !showDueSoon
              ? null
              : dueInDays === 0
                ? "Due today"
                : `Due in ${dueInDays} day${dueInDays === 1 ? "" : "s"}`;

            return (
              <div
                key={t.id}
                className="py-4 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <h4 className="font-semibold truncate">{t.name}</h4>
                    {isRecurring ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-700 shrink-0">
                        Recurring
                      </span>
                    ) : null}
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 shrink-0">
                      Pending
                    </span>
                    {showDueSoon && dueSoonLabel ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-rose-100 text-rose-700 shrink-0">
                        {dueSoonLabel}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-500 truncate">
                    {(t.category_name || "Uncategorized") +
                      " • " +
                      formatDate(t.date)}
                  </p>
                  {t.description ? (
                    <p className="text-sm text-slate-500 truncate">
                      {t.description}
                    </p>
                  ) : null}
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold font-display ${
                        isIncome ? "text-emerald-500" : "text-red-600"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(
                        t.amount,
                        (t.currency as CurrencyCode) || "AFN",
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{t.currency}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="income"
                      loading={isBusy}
                      disabled={isBusy}
                      onClick={() => onMarkDone(t.id)}
                      icon={CheckCircle2}
                      className="shadow-sm hover:shadow-md"
                    >
                      Done
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => onCancel(t.id)}
                      icon={XCircle}
                      className="shadow-none"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
