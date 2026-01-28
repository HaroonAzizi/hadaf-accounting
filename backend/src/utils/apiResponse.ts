import type { Response } from "express";

export function sendSuccess(
  res: Response,
  {
    status = 200,
    data = null,
    message = "OK",
  }: { status?: number; data?: unknown; message?: string } = {},
) {
  return res.status(status).json({ success: true, data, message });
}

export function sendError(
  res: Response,
  {
    status = 500,
    code = "INTERNAL_ERROR",
    message = "Error",
    details,
  }: {
    status?: number;
    code?: string;
    message?: string;
    details?: unknown;
  } = {},
) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  });
}
