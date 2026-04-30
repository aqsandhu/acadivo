// ═══════════════════════════════════════════════
// Mark / Gradebook Routes — All mark management endpoints
// ═══════════════════════════════════════════════

import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateBody } from "../../middleware/validateRequest";
import * as Controller from "./mark.controller";
import * as V from "./mark.validator";

const router = Router();

router.use(authenticate);

// ── Marks CRUD ──
router.get("/marks", Controller.getMarks);
router.put("/:id", authorize("TEACHER", "PRINCIPAL", "ADMIN"), validateBody(V.updateMarkValidator), Controller.updateMark);

// ── Bulk Entry ──
router.post("/marks/bulk", authorize("TEACHER", "PRINCIPAL", "ADMIN"), validateBody(V.bulkMarkValidator), Controller.createBulkMarks);

// ── Student Marks ──
router.get("/student/:studentId", Controller.getStudentMarks);

// ── Calculate Result ──
router.post("/calculate-result", authorize("TEACHER", "PRINCIPAL", "ADMIN"), validateBody(V.calculateResultValidator), Controller.calculateResult);

export default router;
