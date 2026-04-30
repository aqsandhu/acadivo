// ═══════════════════════════════════════════════
// Attendance Routes — All attendance management endpoints
// ═══════════════════════════════════════════════

import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateBody } from "../../middleware/validateRequest";
import * as Controller from "./attendance.controller";
import * as V from "./attendance.validator";

const router = Router();

router.use(authenticate);

// ── Attendance CRUD ──
router.get("/attendance", Controller.getAttendance);
router.post("/attendance/mark", authorize("TEACHER", "PRINCIPAL", "ADMIN"), validateBody(V.markAttendanceValidator), Controller.markAttendance);
router.post("/attendance/bulk", authorize("TEACHER", "PRINCIPAL", "ADMIN"), validateBody(V.markBulkAttendanceValidator), Controller.markBulkAttendance);
router.put("/:id", authorize("TEACHER", "PRINCIPAL", "ADMIN"), validateBody(V.updateAttendanceValidator), Controller.updateAttendance);

// ── Student Attendance ──
router.get("/student/:studentId", Controller.getStudentAttendance);

// ── Summary ──
router.get("/summary", Controller.getAttendanceSummary);

// ── Alerts ──
router.get("/alerts", Controller.getAlerts);
router.put("/alerts/:id/resolve", authorize("TEACHER", "PRINCIPAL", "ADMIN"), Controller.resolveAlert);

export default router;
