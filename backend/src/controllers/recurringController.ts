import type { Request, Response, NextFunction } from "express";

import { sendSuccess } from "../utils/apiResponse";
import { HttpError } from "../utils/httpErrors";
import { addDays, addMonths, addYears, toISODateString } from "../utils/dates";
import { logger } from "../utils/logger";
import * as recurringModel from "../models/recurringModel";
import * as transactionModel from "../models/transactionModel";

function nextDueDate(
  currentIso: string,
  frequency: "daily" | "weekly" | "monthly" | "yearly",
) {
  const [y, m, d] = currentIso.split("-").map((v) => Number(v));
  const current = new Date(y, m - 1, d);

  const next =
    frequency === "daily"
      ? addDays(current, 1)
      : frequency === "weekly"
        ? addDays(current, 7)
        : frequency === "monthly"
          ? addMonths(current, 1)
          : addYears(current, 1);

  return toISODateString(next);
}

export function getRecurring(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = recurringModel.getAllRecurring();
    return sendSuccess(res, {
      data: rows,
      message: "Recurring transactions fetched",
    });
  } catch (e) {
    return next(e);
  }
}

export function getDueRecurring(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const todayIso = toISODateString(new Date());
    const rows = recurringModel.getDueRecurring(todayIso);
    return sendSuccess(res, {
      data: rows,
      message: "Due recurring transactions fetched",
    });
  } catch (e) {
    return next(e);
  }
}

export function createRecurring(
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
      name: string;
      description?: string | null;
      frequency: "daily" | "weekly" | "monthly" | "yearly";
      next_due_date: string;
      is_active?: boolean;
    };

    const next_due_date = String(body.next_due_date).split("T")[0];

    const row = recurringModel.createRecurring({
      category_id: body.category_id,
      amount: body.amount,
      currency: body.currency,
      type: body.type,
      name: body.name,
      description: body.description ?? null,
      frequency: body.frequency,
      next_due_date,
      is_active: body.is_active,
    });

    logger.info("Recurring created", {
      id: row?.id,
      category_id: row?.category_id,
      frequency: row?.frequency,
      next_due_date: row?.next_due_date,
    });

    return sendSuccess(res, {
      status: 201,
      data: row,
      message: "Recurring transaction created",
    });
  } catch (e) {
    return next(e);
  }
}

export function updateRecurring(
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
      name?: string;
      description?: string | null;
      frequency?: "daily" | "weekly" | "monthly" | "yearly";
      next_due_date?: string;
      is_active?: boolean;
    };

    const row = recurringModel.updateRecurring(id, {
      category_id: body.category_id,
      amount: body.amount,
      currency: body.currency,
      type: body.type,
      name: body.name,
      description: body.description,
      frequency: body.frequency,
      next_due_date: body.next_due_date
        ? String(body.next_due_date).split("T")[0]
        : undefined,
      is_active: body.is_active,
    });

    logger.info("Recurring updated", {
      id: row?.id,
      category_id: row?.category_id,
    });

    return sendSuccess(res, {
      data: row,
      message: "Recurring transaction updated",
    });
  } catch (e) {
    return next(e);
  }
}

export function deleteRecurring(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    recurringModel.deleteRecurring(id);
    logger.info("Recurring deleted", { id });
    return sendSuccess(res, {
      data: true,
      message: "Recurring transaction deleted",
    });
  } catch (e) {
    return next(e);
  }
}

export function executeRecurring(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const recurring = recurringModel.getRecurringById(id);
    if (!recurring)
      throw new HttpError({
        status: 404,
        code: "NOT_FOUND",
        message: "Recurring transaction not found",
      });
    if (!recurring.is_active) {
      throw new HttpError({
        status: 400,
        code: "INACTIVE",
        message: "Recurring transaction is inactive",
      });
    }

    const created = transactionModel.createTransaction({
      category_id: recurring.category_id,
      amount: recurring.amount,
      currency: recurring.currency,
      type: recurring.type,
      date: recurring.next_due_date,
      name: recurring.name,
      description: recurring.description,
    });

    const nextDate = nextDueDate(recurring.next_due_date, recurring.frequency);
    const updated = recurringModel.updateNextDueDate(id, nextDate);

    logger.info("Recurring executed", {
      id,
      transaction_id: created?.id,
      next_due_date: nextDate,
    });

    return sendSuccess(res, {
      data: {
        transaction: created,
        recurring: updated,
      },
      message: "Recurring transaction executed",
    });
  } catch (e) {
    return next(e);
  }
}
