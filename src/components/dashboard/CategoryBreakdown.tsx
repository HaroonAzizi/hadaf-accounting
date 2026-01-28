import { ChevronRight } from "lucide-react";

import { Card } from "../common/Card";
import { formatCurrency } from "../../utils/formatters";
import type { CurrencyCode } from "../../utils/constants";

export type CategoryBreakdownItem = {
  categoryId: number;
  categoryName: string;
  income: Record<string, number>;
  expenses: Record<string, number>;
  profit: Record<string, number>;
};

export function CategoryBreakdown({
  data,
  currency = "AFN",
}: {
  data: CategoryBreakdownItem[];
  currency?: CurrencyCode;
}) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold font-display mb-6">
        Profit by Category
      </h3>
      <div className="space-y-4">
        {data.map((category) => (
          <div
            key={category.categoryId}
            className="group p-4 rounded-xl border-2 border-slate-100 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-lg">{category.categoryName}</h4>
              <ChevronRight className="text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Income</p>
                <p className="font-semibold text-income">
                  {formatCurrency(category.income[currency] || 0, currency)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Expense</p>
                <p className="font-semibold text-expense">
                  {formatCurrency(category.expenses[currency] || 0, currency)}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Profit</p>
                <p className="font-semibold text-profit">
                  {formatCurrency(category.profit[currency] || 0, currency)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
