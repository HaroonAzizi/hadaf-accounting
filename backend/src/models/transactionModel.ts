import { getDb } from "../config/database";
import { HttpError } from "../utils/httpErrors";
import type { TransactionStatus, TransactionType } from "../types";
import * as recurringModel from "./recurringModel";
import { nextDueDate as computeNextDueDate } from "../utils/recurring";

export type TransactionRow = {
  id: number;
  category_id: number;
  recurring_id: number | null;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  date: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type TransactionWithCategoryRow = TransactionRow & {
  category_name: string;
};

function findRecurringInstance(recurringId: number, isoDate: string) {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT
        t.id, t.category_id, t.recurring_id, c.name as category_name,
        t.amount, t.currency, t.type, t.status, t.date, t.name, t.description,
        t.created_at, t.updated_at
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE t.recurring_id = ? AND t.date = ?
      ORDER BY t.id DESC
      LIMIT 1`,
    )
    .get(recurringId, isoDate) as TransactionWithCategoryRow | undefined;

  return row ?? null;
}

export function getRecurringInstanceByDate(
  recurringId: number,
  isoDate: string,
) {
  return findRecurringInstance(recurringId, isoDate);
}

export type TransactionFilters = {
  categoryId?: number;
  type?: TransactionType;
  status?: TransactionStatus | "all";
  startDate?: string;
  endDate?: string;
  currency?: string;
};

function buildWhere(filters: TransactionFilters) {
  const clauses: string[] = [];
  const params: Record<string, unknown> = {};

  // Default behavior: only show completed transactions.
  if (filters.status === "all") {
    // no-op
  } else if (filters.status) {
    clauses.push("t.status = @status");
    params.status = filters.status;
  } else {
    clauses.push("t.status = 'done'");
  }

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
      t.id, t.category_id, t.recurring_id, c.name as category_name,
      t.amount, t.currency, t.type, t.status, t.date, t.name, t.description,
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
        t.id, t.category_id, t.recurring_id, c.name as category_name,
        t.amount, t.currency, t.type, t.status, t.date, t.name, t.description,
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
  recurring_id?: number | null;
  amount: number;
  currency: string;
  type: TransactionType;
  status?: TransactionStatus;
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
      `INSERT INTO transactions (category_id, recurring_id, amount, currency, type, status, date, name, description)
       VALUES (@category_id, @recurring_id, @amount, @currency, @type, @status, @date, @name, @description)`,
    )
    .run({
      ...data,
      recurring_id: data.recurring_id ?? null,
      status: data.status ?? "done",
      description: data.description ?? null,
    });

  return getTransactionById(Number(info.lastInsertRowid));
}

export function updateTransaction(
  id: number,
  data: Partial<{
    category_id: number;
    recurring_id: number | null;
    amount: number;
    currency: string;
    type: TransactionType;
    status: TransactionStatus;
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
    recurring_id:
      data.recurring_id === undefined
        ? existing.recurring_id
        : data.recurring_id,
    amount: data.amount ?? existing.amount,
    currency: data.currency ?? existing.currency,
    type: data.type ?? existing.type,
    status: data.status ?? existing.status,
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
         recurring_id = @recurring_id,
         amount = @amount,
         currency = @currency,
         type = @type,
         status = @status,
         date = @date,
         name = @name,
         description = @description,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = @id`,
  ).run({ id, ...next });

  // If this was the current pending installment for a recurring template,
  // advance the template and create the next pending installment.
  const statusChanged = existing.status !== next.status;
  const movedOutOfPending =
    existing.status === "pending" &&
    (next.status === "done" || next.status === "cancelled");

  if (statusChanged && movedOutOfPending && next.recurring_id) {
    const recurring = recurringModel.getRecurringById(next.recurring_id);
    if (recurring && recurring.is_active === 1) {
      // Only advance if user is closing the CURRENT due installment.
      if (existing.date === recurring.next_due_date) {
        const nextDate = computeNextDueDate(
          recurring.next_due_date,
          recurring.frequency,
        );

        recurringModel.updateNextDueDate(recurring.id, nextDate);

        const already = findRecurringInstance(recurring.id, nextDate);
        if (!already) {
          createTransaction({
            category_id: recurring.category_id,
            recurring_id: recurring.id,
            amount: recurring.amount,
            currency: recurring.currency,
            type: recurring.type,
            status: "pending",
            date: nextDate,
            name: recurring.name,
            description: recurring.description,
          });
        }
      }
    }
  }

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
