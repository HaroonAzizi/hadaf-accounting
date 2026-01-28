import { Router } from "express";

import * as dashboardController from "../controllers/dashboardController";
import { validateRequest } from "../middleware/validateRequest";
import { validateDashboardQuery } from "../middleware/validators";

const router = Router();

router.get(
  "/summary",
  validateDashboardQuery,
  validateRequest,
  dashboardController.getSummary,
);

router.get(
  "/followups",
  validateDashboardQuery,
  validateRequest,
  dashboardController.getFollowUps,
);

export default router;
