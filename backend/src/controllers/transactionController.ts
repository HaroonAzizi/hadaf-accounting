import type { Request, Response, NextFunction } from "express";

import { sendSuccess } from "../utils/apiResponse";
import { HttpError } from "../utils/httpErrors";
import { logger } from "../utils/logger";
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
    };

    const date = String(body.date).split("T")[0];

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
