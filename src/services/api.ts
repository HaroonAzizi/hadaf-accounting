import axios from "axios";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  },
);

export type Category = {
  id: number;
  name: string;
  parent_id: number | null;
  type: string;
  created_at: string;
  children?: Category[];
};

export type TransactionType = "in" | "out";

export type Transaction = {
  id: number;
  category_id: number;
  category_name?: string;
  amount: number;
  currency: string;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Frequency = "daily" | "weekly" | "monthly" | "yearly";

export type RecurringTransaction = {
  id: number;
  category_id: number;
  amount: number;
  currency: string;
  type: TransactionType;
  name: string;
  description?: string | null;
  frequency: Frequency;
  next_due_date: string;
  is_active: number;
  created_at: string;
};

export type DashboardSummary = {
  totalIncome: Record<string, number>;
  totalExpenses: Record<string, number>;
  netProfit: Record<string, number>;
  profitByCategory: Array<{
    categoryId: number;
    categoryName: string;
    income: Record<string, number>;
    expenses: Record<string, number>;
    profit: Record<string, number>;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    income: Record<string, number>;
    expenses: Record<string, number>;
    profit: Record<string, number>;
  }>;
};

export const categoriesAPI = {
  getAll: () =>
    api.get<ApiSuccess<Category[]>, ApiSuccess<Category[]>>("/categories"),
  getById: (id: number) =>
    api.get<ApiSuccess<Category>, ApiSuccess<Category>>(`/categories/${id}`),
  create: (data: { name: string; parentId?: number | null; type?: string }) =>
    api.post<ApiSuccess<Category>, ApiSuccess<Category>>("/categories", data),
  update: (id: number, data: { name?: string; parentId?: number | null }) =>
    api.put<ApiSuccess<Category>, ApiSuccess<Category>>(
      `/categories/${id}`,
      data,
    ),
  delete: (id: number) =>
    api.delete<ApiSuccess<boolean>, ApiSuccess<boolean>>(`/categories/${id}`),
};

export const transactionsAPI = {
  getAll: (params?: {
    categoryId?: number;
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
    currency?: string;
  }) =>
    api.get<ApiSuccess<Transaction[]>, ApiSuccess<Transaction[]>>(
      "/transactions",
      { params },
    ),
  getById: (id: number) =>
    api.get<ApiSuccess<Transaction>, ApiSuccess<Transaction>>(
      `/transactions/${id}`,
    ),
  create: (
    data: Omit<
      Transaction,
      "id" | "category_name" | "created_at" | "updated_at"
    >,
  ) =>
    api.post<ApiSuccess<Transaction>, ApiSuccess<Transaction>>(
      "/transactions",
      data,
    ),
  update: (
    id: number,
    data: Partial<
      Omit<Transaction, "id" | "category_name" | "created_at" | "updated_at">
    >,
  ) =>
    api.put<ApiSuccess<Transaction>, ApiSuccess<Transaction>>(
      `/transactions/${id}`,
      data,
    ),
  delete: (id: number) =>
    api.delete<ApiSuccess<boolean>, ApiSuccess<boolean>>(`/transactions/${id}`),
};

export const dashboardAPI = {
  getSummary: (params?: { startDate?: string; endDate?: string }) =>
    api.get<ApiSuccess<DashboardSummary>, ApiSuccess<DashboardSummary>>(
      "/dashboard/summary",
      { params },
    ),
};

export const recurringAPI = {
  getAll: () =>
    api.get<
      ApiSuccess<RecurringTransaction[]>,
      ApiSuccess<RecurringTransaction[]>
    >("/recurring"),
  getDue: () =>
    api.get<
      ApiSuccess<RecurringTransaction[]>,
      ApiSuccess<RecurringTransaction[]>
    >("/recurring/due"),
  create: (data: {
    category_id: number;
    amount: number;
    currency: string;
    type: TransactionType;
    name: string;
    description?: string | null;
    frequency: Frequency;
    next_due_date: string;
    is_active?: boolean;
  }) =>
    api.post<
      ApiSuccess<RecurringTransaction>,
      ApiSuccess<RecurringTransaction>
    >("/recurring", data),
  update: (
    id: number,
    data: Partial<{
      category_id: number;
      amount: number;
      currency: string;
      type: TransactionType;
      name: string;
      description?: string | null;
      frequency: Frequency;
      next_due_date: string;
      is_active: boolean;
    }>,
  ) =>
    api.put<ApiSuccess<RecurringTransaction>, ApiSuccess<RecurringTransaction>>(
      `/recurring/${id}`,
      data,
    ),
  delete: (id: number) =>
    api.delete<ApiSuccess<boolean>, ApiSuccess<boolean>>(`/recurring/${id}`),
  execute: (id: number) =>
    api.post<
      ApiSuccess<{ transaction: Transaction; recurring: RecurringTransaction }>,
      ApiSuccess<{ transaction: Transaction; recurring: RecurringTransaction }>
    >(`/recurring/${id}/execute`, {}),
};

export const exportAPI = {
  csv: (params?: {
    categoryId?: number;
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
    currency?: string;
  }) =>
    api.get<Blob, Blob>("/export/csv", {
      params,
      responseType: "blob",
    }),
  backup: () => api.get<Blob, Blob>("/export/backup", { responseType: "blob" }),
};
