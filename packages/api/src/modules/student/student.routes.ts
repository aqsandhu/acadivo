// ─────────────────────────────────────────────
// Student Routes — All student academic endpoints
// ─────────────────────────────────────────────

import { Router } from "express";
import { authenticate, requireStudent } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as Controller from "./student.controller";
import * as V from "./student.validator";

const router = Router();

router.use(authenticate, requireStudent);

// ── Dashboard & Profile ───────────────────────
router.get("/dashboard", Controller.getDashboard);
router.get("/profile", Controller.getProfile);
router.put("/profile", validate(V.updateProfileValidator), Controller.updateProfile);

// ── Attendance ────────────────────────────────
router.get("/attendance", Controller.getAttendance);
router.get("/attendance/summary", Controller.getAttendanceSummary);

// ── Homework ─────────────────────────────────
router.get("/homework", Controller.getPendingHomework);
router.get("/homework/:id", Controller.getHomeworkDetail);
router.post("/homework/:id/submit", validate(V.submitHomeworkValidator), Controller.submitHomework);
router.get("/homework/submissions", Controller.getMySubmissions);

// ── Q&A ──────────────────────────────────────
router.post("/qa", validate(V.askQuestionValidator), Controller.askQuestion);
router.get("/qa", Controller.getMyQA);
router.get("/qa/public", Controller.getPublicQA);

// ── Results ──────────────────────────────────
router.get("/results", Controller.getResults);
router.get("/results/:id", Controller.getResultDetail);
router.get("/marks", Controller.getMarks);

// ── Timetable ────────────────────────────────
router.get("/timetable", Controller.getTimetable);

// ── Notifications ───────────────────────────
router.get("/notifications", Controller.getNotifications);
router.put("/notifications/:id/read", Controller.markNotificationRead);
router.put("/notifications/read-all", Controller.markAllNotificationsRead);

// ── Messages ─────────────────────────────────
router.get("/messages", Controller.getMessages);
router.post("/messages", validate(V.sendMessageValidator), Controller.sendMessage);

export default router;
