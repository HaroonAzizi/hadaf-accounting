import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Layout } from "../components/layout/Layout";
import { Loading } from "../components/common/Loading";
import { Modal } from "../components/common/Modal";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Input } from "../components/common/Input";
import {
  TransactionForm,
  type TransactionFormValues,
} from "../components/transactions/TransactionForm";
import { TransactionRow } from "../components/transactions/TransactionRow";

import { useCategories } from "../hooks/useCategories";
import { useTransactions } from "../hooks/useTransactions";
import {
  transactionsAPI,
  type Transaction,
  type TransactionCreateInput,
  type TransactionUpdateInput,
} from "../services/api";

function monthRange(month: string | null) {
  if (!month) return { startDate: undefined, endDate: undefined };
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return { startDate: undefined, endDate: undefined };

  const startDate = `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-01`;
  const end = new Date(y, m, 0);
  const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;

  return { startDate, endDate };
}

export default function ExpensesPage() {
  const { categories, loading: categoriesLoading } = useCategories();

  const [month, setMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const { startDate, endDate } = useMemo(() => monthRange(month), [month]);

  const pendingQuery = useTransactions({
    status: "pending",
    type: "out",
  });

  const doneQuery = useTransactions({
    status: "done",
    type: "out",
    startDate,
    endDate,
  });

  useEffect(() => {
    const next = {
      status: "done" as const,
      type: "out" as const,
      startDate,
      endDate,
    };

    const alreadySame =
      doneQuery.filters.status === next.status &&
      doneQuery.filters.type === next.type &&
      doneQuery.filters.startDate === next.startDate &&
      doneQuery.filters.endDate === next.endDate;

    if (!alreadySame) doneQuery.setFilters(next);
  }, [startDate, endDate, doneQuery.filters, doneQuery.setFilters]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const pending = useMemo(
    () =>
      pendingQuery.transactions.filter(
        (t) => t.type === "out" && t.status === "pending",
      ),
    [pendingQuery.transactions],
  );
  const done = useMemo(
    () =>
      doneQuery.transactions.filter(
        (t) => t.type === "out" && t.status === "done",
      ),
    [doneQuery.transactions],
  );

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const ok = window.confirm("Delete this expense? This cannot be undone.");
    if (!ok) return;

    try {
      await transactionsAPI.delete(id);
      toast.success("Expense deleted");
      await Promise.all([pendingQuery.refetch(), doneQuery.refetch()]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete expense",
      );
    }
  };

  const handleSubmit = async (values: TransactionFormValues) => {
    const payload: TransactionCreateInput | TransactionUpdateInput = {
      category_id: values.category_id,
      amount: values.amount,
      currency: values.currency,
      type: "out" as const,
      status: values.status,
      date: values.date,
      name: values.name,
      description: values.description || null,
      recurring: values.is_recurring
        ? { frequency: values.recurring_frequency }
        : undefined,
    };

    try {
      if (editing) {
        await transactionsAPI.update(editing.id, payload);
        toast.success("Expense updated");
      } else {
        await transactionsAPI.create(payload);
        toast.success("Expense created");
      }

      await Promise.all([pendingQuery.refetch(), doneQuery.refetch()]);
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save expense entry",
      );
    }
  };

  const title = editing ? "Edit Expense" : "New Expense";

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">
              Expenses
            </h1>
            <p className="text-slate-600 mt-1">
              View pending and done expenses, filtered by month.
            </p>
          </div>

          <Button onClick={openCreate} size="md">
            New Expense
          </Button>
        </header>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="max-w-xs w-full">
              <Input
                label="Month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
            <div className="text-sm text-slate-600">
              Showing: <span className="font-medium">{month}</span>
            </div>
          </div>
        </div>

        {categoriesLoading || pendingQuery.loading || doneQuery.loading ? (
          <Loading label="Loading expenses..." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6" overflow="visible">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Pending</h3>
                  <p className="text-sm text-slate-500">
                    Expenses waiting to be paid (all months).
                  </p>
                </div>
                <span className="text-sm font-medium text-slate-600">
                  {pending.length}
                </span>
              </div>

              {pending.length === 0 ? (
                <div className="text-sm text-slate-500">
                  No pending expenses.
                </div>
              ) : (
                <div className="space-y-4">
                  {pending.map((t) => (
                    <TransactionRow
                      key={t.id}
                      transaction={t}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6" overflow="visible">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Done</h3>
                  <p className="text-sm text-slate-500">
                    Expenses already paid (selected month).
                  </p>
                </div>
                <span className="text-sm font-medium text-slate-600">
                  {done.length}
                </span>
              </div>

              {done.length === 0 ? (
                <div className="text-sm text-slate-500">
                  No paid expenses for this month.
                </div>
              ) : (
                <div className="space-y-4">
                  {done.map((t) => (
                    <TransactionRow
                      key={t.id}
                      transaction={t}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          title={title}
          size="lg"
        >
          <TransactionForm
            categories={categories}
            initialData={editing}
            lockedType="out"
            onSubmit={handleSubmit}
          />
        </Modal>
      </div>
    </Layout>
  );
}
