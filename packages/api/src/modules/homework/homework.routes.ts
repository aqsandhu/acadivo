// ═══════════════════════════════════════════════
// Homework Routes — All homework management endpoints
// ═══════════════════════════════════════════════

import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateBody } from "../../middleware/validateRequest";
import * as Controller from "./homework.controller";
import * as V from "./homework.validator";

const router = Router();

router.use(authenticate);

// ── Homework CRUD ──
router.get("/", Controller.getHomeworks);
router.get("/:id", Controller.getHomeworkById);
router.post("/", authorize("TEACHER", "PRINCIPAL", "ADMIN"), validateBody(V.createHomeworkValidator), Controller.createHomework);
router.put("/:id", authorize("TEACHER", "PRINCIPAL", "ADMIN"), validateBody(V.updateHomeworkValidator), Controller.updateHomework);
router.delete("/:id", authorize("TEACHER", "PRINCIPAL", "ADMIN"), Controller.deleteHomework);

// ── Submissions ──
router.get("/:id/submissions", Controller.getHomeworkSubmissions);
router.post("/:id/submit", authorize("STUDENT"), validateBody(V.submitHomeworkValidator), Controller.submitHomework);
router.put("/:id/grade", authorize("TEACHER", "PRINCIPAL", "ADMIN"), validateBody(V.gradeSubmissionValidator), Controller.gradeSubmission);

export default router;
