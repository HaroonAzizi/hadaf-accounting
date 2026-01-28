import { getDb } from "../config/database";
import { HttpError } from "../utils/httpErrors";
import type { Frequency, TransactionType } from "../types";

export type RecurringRow = {
  id: number;
  category_id: number;
  amount: number;
  currency: string;
  type: TransactionType;
  name: string;
  description: string | null;
  frequency: Frequency;
  next_due_date: string;
  is_active: number;
  created_at: string;
};

export function getAllRecurring() {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, category_id, amount, currency, type, name, description, frequency, next_due_date, is_active, created_at
       FROM recurring_transactions
       ORDER BY next_due_date ASC, id ASC`,
    )
    .all() as RecurringRow[];
}

export function getRecurringById(id: number) {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, category_id, amount, currency, type, name, description, frequency, next_due_date, is_active, created_at
       FROM recurring_transactions
       WHERE id = ?`,
    )
    .get(id) as RecurringRow | undefined;

  return row ?? null;
}

export function createRecurring(data: {
  category_id: number;
  amount: number;
  currency: string;
  type: TransactionType;
  name: string;
  description?: string | null;
  frequency: Frequency;
  next_due_date: string;
  is_active?: boolean;
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
      `INSERT INTO recurring_transactions
       (category_id, amount, currency, type, name, description, frequency, next_due_date, is_active)
       VALUES (@category_id, @amount, @currency, @type, @name, @description, @frequency, @next_due_date, @is_active)`,
    )
    .run({
      ...data,
      description: data.description ?? null,
      is_active: data.is_active === false ? 0 : 1,
    });

  return getRecurringById(Number(info.lastInsertRowid));
}

export function updateRecurring(
  id: number,
  data: Partial<{
    category_id: number;
    amount: number;
    currency: string;
    type: TransactionType;
    name: string;
    description: string | null;
    frequency: Frequency;
    next_due_date: string;
    is_active: boolean;
  }>,
) {
  const db = getDb();
  const existing = getRecurringById(id);
  if (!existing)
    throw new HttpError({
      status: 404,
      code: "NOT_FOUND",
      message: "Recurring transaction not found",
    });

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

  const next = {
    category_id: data.category_id ?? existing.category_id,
    amount: data.amount ?? existing.amount,
    currency: data.currency ?? existing.currency,
    type: data.type ?? existing.type,
    name: data.name ?? existing.name,
    description: data.description ?? existing.description,
    frequency: data.frequency ?? existing.frequency,
    next_due_date: data.next_due_date ?? existing.next_due_date,
    is_active:
      data.is_active === undefined
        ? existing.is_active
        : data.is_active
          ? 1
          : 0,
  };

  db.prepare(
    `UPDATE recurring_transactions
     SET category_id = @category_id,
         amount = @amount,
         currency = @currency,
         type = @type,
         name = @name,
         description = @description,
         frequency = @frequency,
         next_due_date = @next_due_date,
         is_active = @is_active
     WHERE id = @id`,
  ).run({ id, ...next });

  return getRecurringById(id);
}

export function deleteRecurring(id: number) {
  const db = getDb();
  const existing = getRecurringById(id);
  if (!existing)
    throw new HttpError({
      status: 404,
      code: "NOT_FOUND",
      message: "Recurring transaction not found",
    });

  db.prepare("DELETE FROM recurring_transactions WHERE id = ?").run(id);
  return true;
}

export function getDueRecurring(todayIso: string) {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, category_id, amount, currency, type, name, description, frequency, next_due_date, is_active, created_at
       FROM recurring_transactions
       WHERE is_active = 1 AND next_due_date <= ?
       ORDER BY next_due_date ASC, id ASC`,
    )
    .all(todayIso) as RecurringRow[];
}

export function updateNextDueDate(id: number, nextDate: string) {
  const db = getDb();
  db.prepare(
    "UPDATE recurring_transactions SET next_due_date = ? WHERE id = ?",
  ).run(nextDate, id);
  return getRecurringById(id);
}
