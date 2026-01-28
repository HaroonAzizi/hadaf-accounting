import { body, param, query } from "express-validator";

export const allowedCurrencies = ["AFN", "USD", "TRY", "EUR"] as const;

export const validateIdParam = [param("id").isInt({ min: 1 }).toInt()];

export const validateCategoryCreate = [
  body("name").isString().trim().notEmpty(),
  body("parentId").optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body("type").optional().isString().trim(),
];

export const validateCategoryUpdate = [
  body("name").optional().isString().trim().notEmpty(),
  body("parentId").optional({ nullable: true }).isInt({ min: 1 }).toInt(),
];

export const validateTransactionCreate = [
  body("category_id").isInt({ min: 1 }).toInt(),
  body("amount").isFloat({ gt: 0 }).toFloat(),
  body("currency")
    .isString()
    .isIn([...allowedCurrencies]),
  body("type").isString().isIn(["in", "out"]),
  body("status").optional().isString().isIn(["pending", "done", "cancelled"]),
  body("date").isISO8601({ strict: true }),
  body("name").isString().trim().notEmpty(),
  body("description").optional({ nullable: true }).isString(),
];

export const validateTransactionUpdate = [
  body("category_id").optional().isInt({ min: 1 }).toInt(),
  body("amount").optional().isFloat({ gt: 0 }).toFloat(),
  body("currency")
    .optional()
    .isString()
    .isIn([...allowedCurrencies]),
  body("type").optional().isString().isIn(["in", "out"]),
  body("status").optional().isString().isIn(["pending", "done", "cancelled"]),
  body("date").optional().isISO8601({ strict: true }),
  body("name").optional().isString().trim().notEmpty(),
  body("description").optional({ nullable: true }).isString(),
];

export const validateRecurringCreate = [
  body("category_id").isInt({ min: 1 }).toInt(),
  body("amount").isFloat({ gt: 0 }).toFloat(),
  body("currency")
    .isString()
    .isIn([...allowedCurrencies]),
  body("type").isString().isIn(["in", "out"]),
  body("name").isString().trim().notEmpty(),
  body("description").optional({ nullable: true }).isString(),
  body("frequency").isString().isIn(["daily", "weekly", "monthly", "yearly"]),
  body("next_due_date").isISO8601({ strict: true }),
  body("is_active").optional().isBoolean().toBoolean(),
];

export const validateRecurringUpdate = [
  body("category_id").optional().isInt({ min: 1 }).toInt(),
  body("amount").optional().isFloat({ gt: 0 }).toFloat(),
  body("currency")
    .optional()
    .isString()
    .isIn([...allowedCurrencies]),
  body("type").optional().isString().isIn(["in", "out"]),
  body("name").optional().isString().trim().notEmpty(),
  body("description").optional({ nullable: true }).isString(),
  body("frequency")
    .optional()
    .isString()
    .isIn(["daily", "weekly", "monthly", "yearly"]),
  body("next_due_date").optional().isISO8601({ strict: true }),
  body("is_active").optional().isBoolean().toBoolean(),
];

export const validateDashboardQuery = [
  query("startDate").optional().isISO8601({ strict: true }),
  query("endDate").optional().isISO8601({ strict: true }),
];
