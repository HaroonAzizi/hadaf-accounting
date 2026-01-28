import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { HttpError } from "../utils/httpErrors";

export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  return next(
    new HttpError({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: result.array({ onlyFirstError: true }),
    }),
  );
}
