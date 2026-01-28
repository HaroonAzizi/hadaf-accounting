import { useEffect, useMemo, useState } from "react";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "../common/Card";
import { formatCurrency } from "../../utils/formatters";
import type { CurrencyCode } from "../../utils/constants";

export type SummaryCardProps = {
  title: string;
  amounts: Record<string, number>;
  type?: "income" | "expense" | "neutral";
};

export function SummaryCard({
  title,
  amounts,
  type = "neutral",
}: SummaryCardProps) {
  const [animatedAmounts, setAnimatedAmounts] = useState<
    Record<string, number>
  >({});

  const entries = useMemo(() => Object.entries(amounts || {}), [amounts]);

  useEffect(() => {
    const timers: Array<number> = [];

    setAnimatedAmounts({});

    for (const [currency, amount] of entries) {
      let current = 0;
      const end = Number(amount || 0);
      const durationMs = 800;
      const steps = Math.max(1, Math.floor(durationMs / 16));
      const increment = end / steps;

      const timer = window.setInterval(() => {
        current += increment;
        if (
          (increment >= 0 && current >= end) ||
          (increment < 0 && current <= end)
        ) {
          current = end;
          window.clearInterval(timer);
        }
        setAnimatedAmounts((prev) => ({ ...prev, [currency]: current }));
      }, 16);

      timers.push(timer);
    }

    return () => {
      for (const t of timers) window.clearInterval(t);
    };
  }, [entries]);

  const icon =
    type === "income" ? (
      <TrendingUp className="text-emerald-500" size={32} />
    ) : type === "expense" ? (
      <TrendingDown className="text-red-600" size={32} />
    ) : (
      <DollarSign className="text-sky-500" size={32} />
    );

  const colors =
    type === "income"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : type === "expense"
        ? "border-red-600/30 bg-red-600/5"
        : "border-sky-500/30 bg-sky-500/5";

  return (
    <Card className={`p-6 border-2 ${colors}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
            {title}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white/80 border border-slate-200/70 shadow-sm">
          {icon}
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(animatedAmounts).map(([currency, amount]) => (
          <div key={currency} className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display">
              {formatCurrency(amount, currency as CurrencyCode)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
