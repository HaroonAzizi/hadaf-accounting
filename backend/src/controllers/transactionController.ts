import type { Request, Response, NextFunction } from "express";

import { sendSuccess } from "../utils/apiResponse";
import { HttpError } from "../utils/httpErrors";
import { toISODateString } from "../utils/dates";
import * as transactionModel from "../models/transactionModel";

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

    const rows = transactionModel.getAllTransactions({
      categoryId:
        categoryId && !Number.isNaN(categoryId) ? categoryId : undefined,
      type: type === "in" || type === "out" ? type : undefined,
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
      date: Date;
      name: string;
      description?: string | null;
    };

    const date = toISODateString(body.date);

    const row = transactionModel.createTransaction({
      category_id: body.category_id,
      amount: body.amount,
      currency: body.currency,
      type: body.type,
      date,
      name: body.name,
      description: body.description ?? null,
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
      date?: Date;
      name?: string;
      description?: string | null;
    };

    const row = transactionModel.updateTransaction(id, {
      category_id: body.category_id,
      amount: body.amount,
      currency: body.currency,
      type: body.type,
      date: body.date ? toISODateString(body.date) : undefined,
      name: body.name,
      description: body.description,
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
    return sendSuccess(res, { data: true, message: "Transaction deleted" });
  } catch (e) {
    return next(e);
  }
}
