import { getDb } from "../config/database";
import { HttpError } from "../utils/httpErrors";
import type { TransactionType } from "../types";

export type TransactionRow = {
  id: number;
  category_id: number;
  amount: number;
  currency: string;
  type: TransactionType;
  date: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type TransactionWithCategoryRow = TransactionRow & {
  category_name: string;
};

export type TransactionFilters = {
  categoryId?: number;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  currency?: string;
};

function buildWhere(filters: TransactionFilters) {
  const clauses: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters.categoryId) {
    clauses.push("t.category_id = @categoryId");
    params.categoryId = filters.categoryId;
  }

  if (filters.type) {
    clauses.push("t.type = @type");
    params.type = filters.type;
  }

  if (filters.currency) {
    clauses.push("t.currency = @currency");
    params.currency = filters.currency;
  }

  if (filters.startDate) {
    clauses.push("t.date >= @startDate");
    params.startDate = filters.startDate;
  }

  if (filters.endDate) {
    clauses.push("t.date <= @endDate");
    params.endDate = filters.endDate;
  }

  return {
    whereSql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

export function getAllTransactions(filters: TransactionFilters = {}) {
  const db = getDb();
  const { whereSql, params } = buildWhere(filters);

  const sql = `
    SELECT
      t.id, t.category_id, c.name as category_name,
      t.amount, t.currency, t.type, t.date, t.name, t.description,
      t.created_at, t.updated_at
    FROM transactions t
    JOIN categories c ON c.id = t.category_id
    ${whereSql}
    ORDER BY t.date DESC, t.id DESC
  `;

  return db.prepare(sql).all(params) as TransactionWithCategoryRow[];
}

export function getTransactionById(id: number) {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
        t.id, t.category_id, c.name as category_name,
        t.amount, t.currency, t.type, t.date, t.name, t.description,
        t.created_at, t.updated_at
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE t.id = ?`,
    )
    .get(id) as TransactionWithCategoryRow | undefined;

  return row ?? null;
}

export function createTransaction(data: {
  category_id: number;
  amount: number;
  currency: string;
  type: TransactionType;
  date: string;
  name: string;
  description?: string | null;
}) {
  const db = getDb();

  const category = db
    .prepare("SELECT id FROM categories WHERE id = ?")
    .get(data.category_id) as { id: number } | undefined;
  if (!category)
    throw new HttpError({
      status: 400,
      code: "INVALID_CATEGORY",
      message: "category_id not found",
    });

  const info = db
    .prepare(
      `INSERT INTO transactions (category_id, amount, currency, type, date, name, description)
       VALUES (@category_id, @amount, @currency, @type, @date, @name, @description)`,
    )
    .run({
      ...data,
      description: data.description ?? null,
    });

  return getTransactionById(Number(info.lastInsertRowid));
}

export function updateTransaction(
  id: number,
  data: Partial<{
    category_id: number;
    amount: number;
    currency: string;
    type: TransactionType;
    date: string;
    name: string;
    description: string | null;
  }>,
) {
  const db = getDb();
  const existing = getTransactionById(id);
  if (!existing)
    throw new HttpError({
      status: 404,
      code: "NOT_FOUND",
      message: "Transaction not found",
    });

  const next = {
    category_id: data.category_id ?? existing.category_id,
    amount: data.amount ?? existing.amount,
    currency: data.currency ?? existing.currency,
    type: data.type ?? existing.type,
    date: data.date ?? existing.date,
    name: data.name ?? existing.name,
    description: data.description ?? existing.description,
  };

  if (data.category_id) {
    const category = db
      .prepare("SELECT id FROM categories WHERE id = ?")
      .get(data.category_id) as { id: number } | undefined;
    if (!category)
      throw new HttpError({
        status: 400,
        code: "INVALID_CATEGORY",
        message: "category_id not found",
      });
  }

  db.prepare(
    `UPDATE transactions
     SET category_id = @category_id,
         amount = @amount,
         currency = @currency,
         type = @type,
         date = @date,
         name = @name,
         description = @description,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = @id`,
  ).run({ id, ...next });

  return getTransactionById(id);
}

export function deleteTransaction(id: number) {
  const db = getDb();
  const existing = getTransactionById(id);
  if (!existing)
    throw new HttpError({
      status: 404,
      code: "NOT_FOUND",
      message: "Transaction not found",
    });

  db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
  return true;
}

export function getTransactionsByCategory(categoryId: number) {
  return getAllTransactions({ categoryId });
}

export function getTransactionsByDateRange(startDate: string, endDate: string) {
  return getAllTransactions({ startDate, endDate });
}
