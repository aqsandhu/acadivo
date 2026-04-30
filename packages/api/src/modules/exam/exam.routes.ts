// ═══════════════════════════════════════════════
// Exam Routes — All exam management endpoints
// ═══════════════════════════════════════════════

import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as Controller from "./exam.controller";
import * as V from "./exam.validator";

const router = Router();

router.use(authenticate);

// ── Student Exam View ──
router.get("/my-exams", Controller.getStudentExams);
router.get("/my-results", Controller.getStudentExamResults);

// ── Exam CRUD (Admin/Principal) ──
router.get("/", Controller.getExams);
router.get("/:id", Controller.getExamById);
router.post("/", authorize("PRINCIPAL", "ADMIN"), validate(V.createExamValidator), Controller.createExam);
router.put("/:id", authorize("PRINCIPAL", "ADMIN"), validate(V.updateExamValidator), Controller.updateExam);
router.delete("/:id", authorize("PRINCIPAL", "ADMIN"), Controller.deleteExam);

// ── Exam Schedule ──
router.get("/:examId/schedule", Controller.getExamSchedule);
router.post("/:examId/schedule", authorize("PRINCIPAL", "ADMIN"), validate(V.examScheduleValidator), Controller.addExamSchedule);
router.put("/:examId/schedule/:scheduleId", authorize("PRINCIPAL", "ADMIN"), validate(V.updateExamScheduleValidator), Controller.updateExamSchedule);
router.delete("/:examId/schedule/:scheduleId", authorize("PRINCIPAL", "ADMIN"), Controller.deleteExamSchedule);

// ── Exam Results ──
router.get("/:examId/results", authorize("PRINCIPAL", "ADMIN", "TEACHER"), Controller.getExamResults);
router.post("/:examId/results/:scheduleId", authorize("PRINCIPAL", "ADMIN", "TEACHER"), validate(V.examResultValidator), Controller.addExamResult);
router.post("/:examId/results/:scheduleId/bulk", authorize("PRINCIPAL", "ADMIN", "TEACHER"), validate(V.bulkExamResultsValidator), Controller.addBulkExamResults);
router.delete("/:examId/results/:resultId", authorize("PRINCIPAL", "ADMIN"), Controller.deleteExamResult);

// ── Exam Statistics ──
router.get("/:examId/statistics", authorize("PRINCIPAL", "ADMIN"), Controller.getExamStatistics);

export default router;
