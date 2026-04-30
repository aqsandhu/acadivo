// ═══════════════════════════════════════════════
// Import Routes — Bulk import endpoints
// ═══════════════════════════════════════════════

import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateBody } from "../../middleware/validateRequest";
import * as Controller from "./import.controller";

const router = Router();

router.use(authenticate, authorize("ADMIN", "PRINCIPAL", "SUPER_ADMIN"));

router.post("/students", Controller.importStudentsCSV);
router.post("/teachers", Controller.importTeachersCSV);
router.post("/parents", Controller.importParentsCSV);

export default router;
