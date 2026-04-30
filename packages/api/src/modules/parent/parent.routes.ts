// ─────────────────────────────────────────────
// Parent Routes — All parent academic endpoints
// ─────────────────────────────────────────────

import { Router } from "express";
import { authenticate, requireParent } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as Controller from "./parent.controller";
import * as V from "./parent.validator";
import { validateChildOwnership } from "./parent.middleware";

const router = Router();

router.use(authenticate, requireParent);

// ── Dashboard & Children ─────────────────────
router.get("/dashboard", Controller.getDashboard);
router.get("/children", Controller.getChildren);

// Ownership-protected child routes
router.get("/children/:studentId", validateChildOwnership, Controller.getChildDetail);

// ── Attendance ────────────────────────────────
router.get("/children/:studentId/attendance", validateChildOwnership, Controller.getChildAttendance);
router.get("/children/:studentId/attendance/summary", validateChildOwnership, Controller.getChildAttendanceSummary);

// ── Homework ─────────────────────────────────
router.get("/children/:studentId/homework", validateChildOwnership, Controller.getChildHomework);

// ── Results & Marks ──────────────────────────
router.get("/children/:studentId/results", validateChildOwnership, Controller.getChildResults);
router.get("/children/:studentId/marks", validateChildOwnership, Controller.getChildMarks);

// ── Child Fee Records ─────────────────────────
router.get("/children/:studentId/fee-records", validateChildOwnership, Controller.getChildFeeRecords);
router.get("/children/:studentId/fee-records/:feeRecordId", validateChildOwnership, Controller.getChildFeeRecordDetail);

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
