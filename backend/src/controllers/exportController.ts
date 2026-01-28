import type { Request, Response, NextFunction } from "express";

import path from "path";

import { sendSuccess } from "../utils/apiResponse";
import * as transactionModel from "../models/transactionModel";
import { transactionsToCsv } from "../utils/csvExporter";
import { getDatabasePath } from "../config/database";

export function exportCSV(req: Request, res: Response, next: NextFunction) {
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

    const csv = transactionsToCsv(rows);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="transactions.csv"',
    );
    return res.status(200).send(csv);
  } catch (e) {
    return next(e);
  }
}

export function backupDatabase(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const filePath = getDatabasePath();
    const fileName = path.basename(filePath);
    return res.download(filePath, fileName);
  } catch (e) {
    return next(e);
  }
}

export function exportExcel(req: Request, res: Response, next: NextFunction) {
  try {
    return sendSuccess(res, {
      status: 501,
      data: null,
      message: "Excel export not implemented (use CSV)",
    });
  } catch (e) {
    return next(e);
  }
}
