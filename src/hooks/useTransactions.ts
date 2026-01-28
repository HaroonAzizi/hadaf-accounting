import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  transactionsAPI,
  type Transaction,
  type TransactionType,
} from "../services/api";

export type TransactionFilters = {
  categoryId?: number;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  currency?: string;
};

export function useTransactions(initialFilters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TransactionFilters>(
    initialFilters ?? {},
  );

  const fetchTransactions = useCallback(
    async (next?: TransactionFilters) => {
      setLoading(true);
      try {
        const params = next ?? filters;
        const res = await transactionsAPI.getAll(params);
        setTransactions(res.data);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load transactions",
        );
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  const createTransaction = useCallback(
    async (
      data: Omit<
        Transaction,
        "id" | "category_name" | "created_at" | "updated_at"
      >,
    ) => {
      try {
        await transactionsAPI.create(data);
        toast.success("Transaction created");
        await fetchTransactions();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to create transaction",
        );
      }
    },
    [fetchTransactions],
  );

  const updateTransaction = useCallback(
    async (
      id: number,
      data: Partial<
        Omit<Transaction, "id" | "category_name" | "created_at" | "updated_at">
      >,
    ) => {
      try {
        await transactionsAPI.update(id, data);
        toast.success("Transaction updated");
        await fetchTransactions();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update transaction",
        );
      }
    },
    [fetchTransactions],
  );

  const deleteTransaction = useCallback(
    async (id: number) => {
      try {
        await transactionsAPI.delete(id);
        toast.success("Transaction deleted");
        await fetchTransactions();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete transaction",
        );
      }
    },
    [fetchTransactions],
  );

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  return useMemo(
    () => ({
      transactions,
      loading,
      filters,
      setFilters,
      refetch: fetchTransactions,
      createTransaction,
      updateTransaction,
      deleteTransaction,
    }),
    [
      transactions,
      loading,
      filters,
      fetchTransactions,
      createTransaction,
      updateTransaction,
      deleteTransaction,
    ],
  );
}
