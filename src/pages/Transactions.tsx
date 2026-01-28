import { useMemo, useState } from "react";

import { Layout } from "../components/layout/Layout";
import { Loading } from "../components/common/Loading";
import { Modal } from "../components/common/Modal";
import { Button } from "../components/common/Button";
import { TransactionFilters } from "../components/transactions/TransactionFilters";
import { TransactionList } from "../components/transactions/TransactionList";
import {
  TransactionForm,
  type TransactionFormValues,
} from "../components/transactions/TransactionForm";

import { useCategories } from "../hooks/useCategories";
import { useTransactions } from "../hooks/useTransactions";
import type { Transaction } from "../services/api";

export default function TransactionsPage() {
  const { categories, loading: categoriesLoading } = useCategories();
  const {
    transactions,
    loading: txLoading,
    filters,
    setFilters,
    refetch,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const title = useMemo(
    () => (editing ? "Edit Transaction" : "New Transaction"),
    [editing],
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
    const ok = window.confirm(
      "Delete this transaction? This cannot be undone.",
    );
    if (!ok) return;
    await deleteTransaction(id);
  };

  const handleSubmit = async (values: TransactionFormValues) => {
    const payload = {
      category_id: values.category_id,
      amount: values.amount,
      currency: values.currency,
      type: values.type,
      status: values.status,
      date: values.date,
      name: values.name,
      description: values.description || null,
      recurring: values.is_recurring
        ? { frequency: values.recurring_frequency }
        : undefined,
    };

    if (editing) {
      await updateTransaction(editing.id, payload);
    } else {
      await createTransaction(payload);
    }

    setModalOpen(false);
    setEditing(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">
              Transactions
            </h1>
            <p className="text-slate-600 mt-1">
              Track income and expenses, filter, and edit entries.
            </p>
          </div>

          <Button onClick={openCreate} size="md">
            New Transaction
          </Button>
        </header>

        <TransactionFilters
          categories={categories}
          filters={filters}
          setFilters={setFilters}
          onApply={() => void refetch(filters)}
          onReset={() => {
            setFilters({});
            void refetch({});
          }}
        />

        {categoriesLoading || txLoading ? (
          <Loading label="Loading transactions..." />
        ) : (
          <TransactionList
            transactions={transactions}
            onCreate={openCreate}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
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
            onSubmit={handleSubmit}
          />
        </Modal>
      </div>
    </Layout>
  );
}
