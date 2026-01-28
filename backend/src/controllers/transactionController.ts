import type { Request, Response, NextFunction } from "express";

import { sendSuccess } from "../utils/apiResponse";
import { HttpError } from "../utils/httpErrors";
import { logger } from "../utils/logger";
import * as transactionModel from "../models/transactionModel";
import * as recurringModel from "../models/recurringModel";
import { nextDueDate as computeNextDueDate } from "../utils/recurring";
import { getDb } from "../config/database";

export function getTransactions(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const categoryId = req.query.categoryId
      ? Number(req.query.categoryId)
      : undefined;
    const type = req.query.type ? String(req.query.type) : undefined;
    const currency = req.query.currency
      ? String(req.query.currency)
      : undefined;
    const startDate = req.query.startDate
      ? String(req.query.startDate)
      : undefined;
    const endDate = req.query.endDate ? String(req.query.endDate) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;

    const rows = transactionModel.getAllTransactions({
      categoryId:
        categoryId && !Number.isNaN(categoryId) ? categoryId : undefined,
      type: type === "in" || type === "out" ? type : undefined,
      status:
        status === "pending" || status === "done" || status === "cancelled"
          ? status
          : status === "all"
            ? "all"
            : undefined,
      currency,
      startDate,
      endDate,
    });

    return sendSuccess(res, { data: rows, message: "Transactions fetched" });
  } catch (e) {
    return next(e);
  }
}

export function getTransactionById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const row = transactionModel.getTransactionById(id);
    if (!row)
      throw new HttpError({
        status: 404,
        code: "NOT_FOUND",
        message: "Transaction not found",
      });
    return sendSuccess(res, { data: row, message: "Transaction fetched" });
  } catch (e) {
    return next(e);
  }
}

export function createTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = req.body as {
      category_id: number;
      amount: number;
      currency: string;
      type: "in" | "out";
      status?: "pending" | "done" | "cancelled";
      date: string;
      name: string;
      description?: string | null;
      recurring?: {
        frequency: "daily" | "weekly" | "monthly" | "yearly";
      };
    };

    const date = String(body.date).split("T")[0];

    // When a transaction is marked as recurring, we create a recurring template
    // and also create the next pending installment for dashboard follow-ups.
    if (body.recurring?.frequency) {
      if (body.status === "pending") {
        throw new HttpError({
          status: 400,
          code: "INVALID_STATUS",
          message:
            "Recurring setup requires the first transaction to be paid (status: done).",
        });
      }

      const db = getDb();
      const create = db.transaction(() => {
        const next_due_date = computeNextDueDate(
          date,
          body.recurring!.frequency,
        );

        const recurring = recurringModel.createRecurring({
          category_id: body.category_id,
          amount: body.amount,
          currency: body.currency,
          type: body.type,
          name: body.name,
          description: body.description ?? null,
          frequency: body.recurring!.frequency,
          next_due_date,
          is_active: true,
        });

        if (!recurring) {
          throw new HttpError({
            status: 500,
            code: "RECURRING_CREATE_FAILED",
            message: "Failed to create recurring transaction",
          });
        }

        const first = transactionModel.createTransaction({
          category_id: body.category_id,
          recurring_id: recurring.id,
          amount: body.amount,
          currency: body.currency,
          type: body.type,
          status: body.status ?? "done",
          date,
          name: body.name,
          description: body.description ?? null,
        });

        transactionModel.createTransaction({
          category_id: recurring.category_id,
          recurring_id: recurring.id,
          amount: recurring.amount,
          currency: recurring.currency,
          type: recurring.type,
          status: "pending",
          date: recurring.next_due_date,
          name: recurring.name,
          description: recurring.description,
        });

        return { first, recurring };
      });

      const { first, recurring } = create();

      logger.info("Transaction created (recurring)", {
        id: first?.id,
        recurring_id: recurring.id,
        category_id: first?.category_id,
        amount: first?.amount,
        currency: first?.currency,
        type: first?.type,
        next_due_date: recurring.next_due_date,
      });

      return sendSuccess(res, {
        status: 201,
        data: first,
        message: "Transaction created",
      });
    }

    const row = transactionModel.createTransaction({
      category_id: body.category_id,
      amount: body.amount,
      currency: body.currency,
      type: body.type,
      status: body.status,
      date,
      name: body.name,
      description: body.description ?? null,
    });

    logger.info("Transaction created", {
      id: row?.id,
      category_id: row?.category_id,
      amount: row?.amount,
      currency: row?.currency,
      type: row?.type,
    });

    return sendSuccess(res, {
      status: 201,
      data: row,
      message: "Transaction created",
    });
  } catch (e) {
    return next(e);
  }
}

export function updateTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const body = req.body as {
      category_id?: number;
      amount?: number;
      currency?: string;
      type?: "in" | "out";
      status?: "pending" | "done" | "cancelled";
      date?: string;
      name?: string;
      description?: string | null;
    };

    const row = transactionModel.updateTransaction(id, {
      category_id: body.category_id,
      amount: body.amount,
      currency: body.currency,
      type: body.type,
      status: body.status,
      date: body.date ? String(body.date).split("T")[0] : undefined,
      name: body.name,
      description: body.description,
    });

    logger.info("Transaction updated", {
      id: row?.id,
      category_id: row?.category_id,
    });

    return sendSuccess(res, { data: row, message: "Transaction updated" });
  } catch (e) {
    return next(e);
  }
}

export function deleteTransaction(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    transactionModel.deleteTransaction(id);
    logger.info("Transaction deleted", { id });
    return sendSuccess(res, { data: true, message: "Transaction deleted" });
  } catch (e) {
    return next(e);
  }
}
