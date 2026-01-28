import type { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/apiResponse";

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, {
    status: 404,
    code: "NOT_FOUND",
    message: "Route not found",
  });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  void _next;

  const maybeErr: Record<string, unknown> =
    typeof err === "object" && err !== null
      ? (err as Record<string, unknown>)
      : {};

  const status = typeof maybeErr.status === "number" ? maybeErr.status : 500;
  const code =
    typeof maybeErr.code === "string" ? maybeErr.code : "INTERNAL_ERROR";
  const message =
    typeof maybeErr.message === "string"
      ? maybeErr.message
      : "Internal server error";
  const details = maybeErr.details;

  console.error(err);

  return sendError(res, { status, code, message, details });
}
