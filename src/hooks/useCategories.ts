import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  type Category,
  categoriesAPI,
  type ApiResponse,
} from "../services/api";

function unwrap<T>(res: ApiResponse<T>): T {
  if (res.success) return res.data;
  throw new Error(res.error?.message || "Request failed");
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoriesAPI.getAll();
      setCategories(unwrap(res));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load categories",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(
    async (data: { name: string; parentId?: number | null; type?: string }) => {
      try {
        await categoriesAPI.create(data);
        toast.success("Category created");
        await fetchCategories();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to create category",
        );
      }
    },
    [fetchCategories],
  );

  const updateCategory = useCallback(
    async (id: number, data: { name?: string; parentId?: number | null }) => {
      try {
        await categoriesAPI.update(id, data);
        toast.success("Category updated");
        await fetchCategories();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update category",
        );
      }
    },
    [fetchCategories],
  );

  const deleteCategory = useCallback(
    async (id: number) => {
      try {
        await categoriesAPI.delete(id);
        toast.success("Category deleted");
        await fetchCategories();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete category",
        );
      }
    },
    [fetchCategories],
  );

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  return useMemo(
    () => ({
      categories,
      loading,
      createCategory,
      updateCategory,
      deleteCategory,
      refetch: fetchCategories,
    }),
    [
      categories,
      loading,
      createCategory,
      updateCategory,
      deleteCategory,
      fetchCategories,
    ],
  );
}
