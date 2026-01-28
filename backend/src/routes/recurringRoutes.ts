import { Router } from "express";

import * as recurringController from "../controllers/recurringController";
import { validateRequest } from "../middleware/validateRequest";
import {
  validateIdParam,
  validateRecurringCreate,
  validateRecurringUpdate,
} from "../middleware/validators";

const router = Router();

router.get("/", recurringController.getRecurring);
router.get("/due", recurringController.getDueRecurring);
router.post(
  "/",
  validateRecurringCreate,
  validateRequest,
  recurringController.createRecurring,
);
router.put(
  "/:id",
  validateIdParam,
  validateRecurringUpdate,
  validateRequest,
  recurringController.updateRecurring,
);
router.delete(
  "/:id",
  validateIdParam,
  validateRequest,
  recurringController.deleteRecurring,
);
router.post(
  "/:id/execute",
  validateIdParam,
  validateRequest,
  recurringController.executeRecurring,
);

export default router;
