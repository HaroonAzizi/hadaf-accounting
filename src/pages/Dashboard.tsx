import { useCallback, useMemo, useState } from "react";

import { Layout } from "../components/layout/Layout";
import { SummaryCard } from "../components/dashboard/SummaryCard";
import {
  MonthlyChart,
  type MonthlyChartRow,
} from "../components/dashboard/MonthlyChart";
import { CategoryBreakdown } from "../components/dashboard/CategoryBreakdown";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";
import { FollowUps } from "../components/dashboard/FollowUps";
import { Loading } from "../components/common/Loading";

import { useAppContext } from "../context/AppContext";
import { useDashboard } from "../hooks/useDashboard";
import { useTransactions } from "../hooks/useTransactions";
import { Moon, Sun } from "lucide-react";

export default function DashboardPage() {
  const { dateRange, theme, toggleTheme } = useAppContext();
  const {
    summary,
    followUps,
    loading: dashboardLoading,
    refetch: refetchDashboard,
  } = useDashboard(dateRange);
  const {
    transactions,
    loading: txLoading,
    updateTransaction,
  } = useTransactions({
    startDate: dateRange.startDate ?? undefined,
    endDate: dateRange.endDate ?? undefined,
  });

  const [busyFollowUps, setBusyFollowUps] = useState<Set<number>>(new Set());

  const markBusy = useCallback((id: number, busy: boolean) => {
    setBusyFollowUps((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleFollowUpStatus = useCallback(
    async (id: number, status: "done" | "cancelled") => {
      markBusy(id, true);
      try {
        await updateTransaction(id, { status });
        await refetchDashboard();
      } finally {
        markBusy(id, false);
      }
    },
    [markBusy, refetchDashboard, updateTransaction],
  );

  const recentTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    return sorted.slice(0, 6);
  }, [transactions]);

  const followUpsSorted = useMemo(() => {
    const pending = (followUps || []).filter((t) => t.status === "pending");
    return [...pending].sort((a, b) => a.date.localeCompare(b.date));
  }, [followUps]);

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
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Income, expenses, and profit — in one glance.
            </p>
          </div>

          <button
            onClick={toggleTheme}
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/40 backdrop-blur hover:bg-white dark:hover:bg-slate-900 transition-colors"
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-slate-200" />
            ) : (
              <Moon size={18} className="text-slate-700" />
            )}
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </button>
        </header>

        {dashboardLoading || !summary ? (
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

            <section>
              <FollowUps
                items={followUpsSorted}
                busyIds={busyFollowUps}
                onMarkDone={(id) => void handleFollowUpStatus(id, "done")}
                onCancel={(id) => void handleFollowUpStatus(id, "cancelled")}
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
