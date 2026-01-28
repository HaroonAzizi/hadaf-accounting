import { useMemo, useState } from "react";

import { Layout } from "../components/layout/Layout";
import { Loading } from "../components/common/Loading";
import { Modal } from "../components/common/Modal";
import { Button } from "../components/common/Button";
import { RecurringList } from "../components/recurring/RecurringList";
import {
  RecurringForm,
  type RecurringFormValues,
} from "../components/recurring/RecurringForm";

import { useCategories } from "../hooks/useCategories";
import { useRecurring } from "../hooks/useRecurring";
import type { RecurringTransaction } from "../services/api";

export default function RecurringPage() {
  const { categories, loading: categoriesLoading } = useCategories();
  const {
    recurring,
    due,
    loading,
    createRecurring,
    updateRecurring,
    deleteRecurring,
    executeRecurring,
  } = useRecurring();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);

  const dueIds = useMemo(() => new Set(due.map((d) => d.id)), [due]);
  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>();
    const walk = (nodes: typeof categories) => {
      for (const c of nodes) {
        map.set(c.id, c.name);
        if (c.children?.length) walk(c.children);
      }
    };
    walk(categories);
    return map;
  }, [categories]);

  const title = useMemo(
    () => (editing ? "Edit Recurring" : "New Recurring"),
    [editing],
  );

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (t: RecurringTransaction) => {
    setEditing(t);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const ok = window.confirm(
      "Delete this recurring item? This cannot be undone.",
    );
    if (!ok) return;
    await deleteRecurring(id);
  };

  const handleExecute = async (id: number) => {
    const ok = window.confirm(
      "Execute this recurring item now? It will create a transaction.",
    );
    if (!ok) return;
    await executeRecurring(id);
  };

  const handleSubmit = async (values: RecurringFormValues) => {
    const payload = {
      category_id: values.category_id,
      amount: values.amount,
      currency: values.currency,
      type: values.type,
      name: values.name,
      description: values.description || null,
      frequency: values.frequency,
      next_due_date: values.next_due_date,
      is_active: values.is_active,
    };

    if (editing) {
      await updateRecurring(editing.id, payload);
    } else {
      await createRecurring(payload);
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
              Recurring
            </h1>
            <p className="text-slate-600 mt-1">
              Automate repeating transactions and execute due items.
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {due.length > 0 ? `${due.length} item(s) due` : "No items due"}
            </p>
          </div>

          <Button onClick={openCreate} size="md">
            New Recurring
          </Button>
        </header>

        {loading || categoriesLoading ? (
          <Loading label="Loading recurring..." />
        ) : (
          <RecurringList
            items={recurring}
            dueIds={dueIds}
            categoryNameById={categoryNameById}
            onCreate={openCreate}
            onEdit={openEdit}
            onDelete={handleDelete}
            onExecute={handleExecute}
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
          <RecurringForm
            categories={categories}
            initialData={editing}
            onSubmit={handleSubmit}
          />
        </Modal>
      </div>
    </Layout>
  );
}
