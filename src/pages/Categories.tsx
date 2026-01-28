import { useMemo, useState } from "react";

import { Layout } from "../components/layout/Layout";
import { Loading } from "../components/common/Loading";
import { Modal } from "../components/common/Modal";
import { Button } from "../components/common/Button";
import { CategoryList } from "../components/categories/CategoryList";
import {
  CategoryForm,
  type CategoryFormValues,
} from "../components/categories/CategoryForm";

import { useCategories } from "../hooks/useCategories";
import type { Category } from "../services/api";

export default function CategoriesPage() {
  const {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const title = useMemo(
    () => (editing ? `Edit Category` : "New Category"),
    [editing],
  );

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const ok = window.confirm("Delete this category? This cannot be undone.");
    if (!ok) return;
    await deleteCategory(id);
  };

  const handleSubmit = async (values: {
    name: string;
    parentId: number | null;
    type?: string;
  }) => {
    if (editing) {
      await updateCategory(editing.id, {
        name: values.name,
        parentId: values.parentId,
      });
    } else {
      await createCategory({
        name: values.name,
        parentId: values.parentId,
        type: values.type,
      });
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
              Categories
            </h1>
            <p className="text-slate-600 mt-1">
              Organize income and expenses with nested categories.
            </p>
          </div>

          <Button onClick={openCreate} size="md">
            New Category
          </Button>
        </header>

        {loading ? (
          <Loading label="Loading categories..." />
        ) : (
          <CategoryList
            categories={categories}
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
          size="md"
        >
          <CategoryForm
            categories={categories}
            initial={editing}
            onSubmit={handleSubmit as (values: CategoryFormValues) => void}
          />
          {editing ? (
            <p className="mt-3 text-xs text-slate-500">
              Note: category type is set on creation.
            </p>
          ) : null}
        </Modal>
      </div>
    </Layout>
  );
}
