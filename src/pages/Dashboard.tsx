import { useMemo } from "react";

import { Layout } from "../components/layout/Layout";
import { SummaryCard } from "../components/dashboard/SummaryCard";
import {
  MonthlyChart,
  type MonthlyChartRow,
} from "../components/dashboard/MonthlyChart";
import { CategoryBreakdown } from "../components/dashboard/CategoryBreakdown";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";
import { Loading } from "../components/common/Loading";

import { useAppContext } from "../context/AppContext";
import { useDashboard } from "../hooks/useDashboard";
import { useTransactions } from "../hooks/useTransactions";

export default function DashboardPage() {
  const { dateRange } = useAppContext();
  const { summary, loading: summaryLoading } = useDashboard(dateRange);
  const { transactions, loading: txLoading } = useTransactions({
    startDate: dateRange.startDate ?? undefined,
    endDate: dateRange.endDate ?? undefined,
  });

  const recentTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    return sorted.slice(0, 6);
  }, [transactions]);

  const monthlyChartData = useMemo<MonthlyChartRow[]>(() => {
    const rows = summary?.monthlyBreakdown ?? [];
    return rows.map((r) => ({
      month: r.month,
      income: r.income.AFN ?? 0,
      expense: r.expenses.AFN ?? 0,
      profit: r.profit.AFN ?? 0,
    }));
  }, [summary]);

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Income, expenses, and profit — in one glance.
            </p>
          </div>
        </header>

        {summaryLoading || !summary ? (
          <Loading label="Loading dashboard..." />
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SummaryCard
                title="Total Income"
                amounts={summary.totalIncome}
                type="income"
              />
              <SummaryCard
                title="Total Expenses"
                amounts={summary.totalExpenses}
                type="expense"
              />
              <SummaryCard
                title="Net Profit"
                amounts={summary.netProfit}
                type="neutral"
              />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <MonthlyChart data={monthlyChartData} />
              <CategoryBreakdown
                data={summary.profitByCategory}
                currency="AFN"
              />
            </section>
          </>
        )}

        <section>
          {txLoading ? (
            <Loading label="Loading recent transactions..." />
          ) : (
            <RecentTransactions transactions={recentTransactions} />
          )}
        </section>
      </div>
    </Layout>
  );
}
