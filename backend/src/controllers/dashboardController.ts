import type { Request, Response, NextFunction } from "express";

import { sendSuccess } from "../utils/apiResponse";
import * as transactionModel from "../models/transactionModel";
import {
  groupMonthlyBreakdown,
  groupProfitByCategory,
} from "../utils/calculations";

function toIsoDateLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysLocal(d: Date, days: number) {
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function currencyTotalsFromRows(
  rows: Array<{ currency: string; amount: number }>,
) {
  const out: Record<string, number> = {};
  for (const r of rows) out[r.currency] = (out[r.currency] ?? 0) + r.amount;
  return out;
}

export function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const startDate = req.query.startDate
      ? String(req.query.startDate)
      : undefined;
    const endDate = req.query.endDate ? String(req.query.endDate) : undefined;

    const rows = transactionModel.getAllTransactions({ startDate, endDate });

    const incomeRows = rows
      .filter((r) => r.type === "in")
      .map((r) => ({ currency: r.currency, amount: r.amount }));
    const expenseRows = rows
      .filter((r) => r.type === "out")
      .map((r) => ({ currency: r.currency, amount: r.amount }));

    const totalIncome = currencyTotalsFromRows(incomeRows);
    const totalExpenses = currencyTotalsFromRows(expenseRows);

    const netProfit: Record<string, number> = {};
    const currencies = new Set([
      ...Object.keys(totalIncome),
      ...Object.keys(totalExpenses),
    ]);
    for (const c of currencies)
      netProfit[c] = (totalIncome[c] ?? 0) - (totalExpenses[c] ?? 0);

    const profitByCategory = groupProfitByCategory(rows);
    const monthlyBreakdown = groupMonthlyBreakdown(rows);

    return sendSuccess(res, {
      data: {
        totalIncome,
        totalExpenses,
        netProfit,
        profitByCategory,
        monthlyBreakdown,
      },
      message: "Dashboard summary fetched",
    });
  } catch (e) {
    return next(e);
  }
}

export function getFollowUps(req: Request, res: Response, next: NextFunction) {
  try {
    // Follow-ups are meant as an operational reminder list, independent of the
    // dashboard date range filters: show recurring installments due soon.
    const today = new Date();
    const startDate = toIsoDateLocal(
      new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    );
    const endDate = toIsoDateLocal(addDaysLocal(today, 3));

    const rows = transactionModel.getAllTransactions({
      status: "pending",
      startDate,
      endDate,
    });

    const recurringOnly = rows.filter((r) => r.recurring_id !== null);

    const sorted = [...recurringOnly].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    return sendSuccess(res, {
      data: sorted,
      message: "Follow-ups fetched",
    });
  } catch (e) {
    return next(e);
  }
}
