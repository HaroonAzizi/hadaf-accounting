import { Router } from "express";

import * as transactionController from "../controllers/transactionController";
import { validateRequest } from "../middleware/validateRequest";
import {
  validateIdParam,
  validateTransactionCreate,
  validateTransactionUpdate,
} from "../middleware/validators";

const router = Router();

router.get("/", transactionController.getTransactions);
router.get(
  "/:id",
  validateIdParam,
  validateRequest,
  transactionController.getTransactionById,
);
router.post(
  "/",
  validateTransactionCreate,
  validateRequest,
  transactionController.createTransaction,
);
router.put(
  "/:id",
  validateIdParam,
  validateTransactionUpdate,
  validateRequest,
  transactionController.updateTransaction,
);
router.delete(
  "/:id",
  validateIdParam,
  validateRequest,
  transactionController.deleteTransaction,
);

export default router;
