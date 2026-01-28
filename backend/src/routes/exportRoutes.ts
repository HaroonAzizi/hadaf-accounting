import { Router } from "express";

import * as exportController from "../controllers/exportController";

const router = Router();

router.get("/csv", exportController.exportCSV);
router.get("/backup", exportController.backupDatabase);

export default router;
