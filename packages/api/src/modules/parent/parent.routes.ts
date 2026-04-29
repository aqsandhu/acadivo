// ─────────────────────────────────────────────
// Parent Routes — All parent academic endpoints
// ─────────────────────────────────────────────

import { Router } from "express";
import { authenticate, requireParent } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as Controller from "./parent.controller";
import * as V from "./parent.validator";

const router = Router();

router.use(authenticate, requireParent);

// ── Dashboard & Children ─────────────────────
router.get("/dashboard", Controller.getDashboard);
router.get("/children", Controller.getChildren);
router.get("/children/:studentId", Controller.getChildDetail);

// ── Attendance ────────────────────────────────
router.get("/children/:studentId/attendance", Controller.getChildAttendance);
router.get("/children/:studentId/attendance/summary", Controller.getChildAttendanceSummary);

// ── Homework ─────────────────────────────────
router.get("/children/:studentId/homework", Controller.getChildHomework);

// ── Results & Marks ──────────────────────────
router.get("/children/:studentId/results", Controller.getChildResults);
router.get("/children/:studentId/marks", Controller.getChildMarks);

// ── Report Requests ──────────────────────────
router.post("/report-request", validate(V.reportRequestValidator), Controller.createReportRequest);
router.get("/report-requests", Controller.getReportRequests);
router.get("/report-requests/:id", Controller.getReportRequestDetail);

// ── Q&A ──────────────────────────────────────
router.post("/qa", validate(V.askQuestionValidator), Controller.askQuestion);
router.get("/qa", Controller.getMyQA);

// ── Fee ─────────────────────────────────────
router.get("/fee-records", Controller.getFeeRecords);
router.get("/fee-records/:id", Controller.getFeeRecordDetail);
router.get("/fee-due", Controller.getFeeDue);

// ── Messages ─────────────────────────────────
router.get("/messages", Controller.getMessages);
router.post("/messages", validate(V.sendMessageValidator), Controller.sendMessage);

// ── Notifications ───────────────────────────
router.get("/notifications", Controller.getNotifications);
router.put("/notifications/:id/read", Controller.markNotificationRead);

export default router;
