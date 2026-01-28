import { Router } from "express";

import * as categoryController from "../controllers/categoryController";
import { validateRequest } from "../middleware/validateRequest";
import {
  validateCategoryCreate,
  validateCategoryUpdate,
  validateIdParam,
} from "../middleware/validators";

const router = Router();

router.get("/", categoryController.getCategories);
router.get(
  "/:id",
  validateIdParam,
  validateRequest,
  categoryController.getCategoryById,
);
router.get(
  "/:id/stats",
  validateIdParam,
  validateRequest,
  categoryController.getCategoryStats,
);
router.post(
  "/",
  validateCategoryCreate,
  validateRequest,
  categoryController.createCategory,
);
router.put(
  "/:id",
  validateIdParam,
  validateCategoryUpdate,
  validateRequest,
  categoryController.updateCategory,
);
router.delete(
  "/:id",
  validateIdParam,
  validateRequest,
  categoryController.deleteCategory,
);

export default router;
