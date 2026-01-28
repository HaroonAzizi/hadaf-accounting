import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  recurringAPI,
  type Frequency,
  type RecurringTransaction,
  type TransactionType,
} from "../services/api";

export type RecurringCreateInput = {
  category_id: number;
  amount: number;
  currency: string;
  type: TransactionType;
  name: string;
  description?: string | null;
  frequency: Frequency;
  next_due_date: string;
  is_active?: boolean;
};

export function useRecurring() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [due, setDue] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recurringAPI.getAll();
      setRecurring(res.data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load recurring",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDue = useCallback(async () => {
    try {
      const res = await recurringAPI.getDue();
      setDue(res.data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load due items",
      );
    }
  }, []);

  const createRecurring = useCallback(
    async (data: RecurringCreateInput) => {
      try {
        await recurringAPI.create(data);
        toast.success("Recurring created");
        await Promise.all([fetchAll(), fetchDue()]);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to create recurring",
        );
      }
    },
    [fetchAll, fetchDue],
  );

  const updateRecurring = useCallback(
    async (
      id: number,
      data: Partial<RecurringCreateInput & { is_active: boolean }>,
    ) => {
      try {
        await recurringAPI.update(id, data);
        toast.success("Recurring updated");
        await Promise.all([fetchAll(), fetchDue()]);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update recurring",
        );
      }
    },
    [fetchAll, fetchDue],
  );

  const deleteRecurring = useCallback(
    async (id: number) => {
      try {
        await recurringAPI.delete(id);
        toast.success("Recurring deleted");
        await Promise.all([fetchAll(), fetchDue()]);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete recurring",
        );
      }
    },
    [fetchAll, fetchDue],
  );

  const executeRecurring = useCallback(
    async (id: number) => {
      try {
        await recurringAPI.execute(id);
        toast.success("Recurring executed");
        await Promise.all([fetchAll(), fetchDue()]);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to execute recurring",
        );
      }
    },
    [fetchAll, fetchDue],
  );

  useEffect(() => {
    void fetchAll();
    void fetchDue();
  }, [fetchAll, fetchDue]);

  return useMemo(
    () => ({
      recurring,
      due,
      loading,
      refetchAll: fetchAll,
      refetchDue: fetchDue,
      createRecurring,
      updateRecurring,
      deleteRecurring,
      executeRecurring,
    }),
    [
      recurring,
      due,
      loading,
      fetchAll,
      fetchDue,
      createRecurring,
      updateRecurring,
      deleteRecurring,
      executeRecurring,
    ],
  );
}
