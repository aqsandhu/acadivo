// ═══════════════════════════════════════════════
// Timetable Routes — All timetable / class schedule endpoints
// ═══════════════════════════════════════════════

import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateBody } from "../../middleware/validateRequest";
import * as Controller from "./timetable.controller";
import * as V from "./timetable.validator";

const router = Router();

router.use(authenticate);

// ── Timetable CRUD ──
router.get("/timetable", Controller.getTimetable);
router.post("/timetable", authorize("PRINCIPAL", "ADMIN"), validateBody(V.createScheduleValidator), Controller.createSchedule);
router.put("/:id", authorize("PRINCIPAL", "ADMIN"), validateBody(V.updateScheduleValidator), Controller.updateSchedule);
router.delete("/:id", authorize("PRINCIPAL", "ADMIN"), Controller.deleteSchedule);

// ── Bulk ──
router.post("/timetable/bulk", authorize("PRINCIPAL", "ADMIN"), validateBody(V.bulkScheduleValidator), Controller.createBulkSchedules);

// ── Teacher Timetable ──
router.get("/teacher/:teacherId", Controller.getTeacherTimetable);

// ── Conflicts ──
router.get("/conflicts", Controller.getConflicts);

export default router;
