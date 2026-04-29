// ─────────────────────────────────────────────
// Teacher Routes — All teacher academic endpoints
// ─────────────────────────────────────────────

import { Router } from "express";
import { authenticate, requireTeacher } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as Controller from "./teacher.controller";
import * as V from "./teacher.validator";

const router = Router();

// Apply auth + teacher role to all routes
router.use(authenticate, requireTeacher);

// ── Dashboard ─────────────────────────────────
router.get("/dashboard", Controller.getDashboard);
router.get("/classes", Controller.getMyClasses);
router.get("/timetable", Controller.getMyTimetable);

// ── Attendance ────────────────────────────────
router.get("/attendance/class/:classId/section/:sectionId", Controller.getClassAttendanceToday);
router.post("/attendance", validate(V.attendanceMarkValidator), Controller.markAttendance);
router.put("/attendance/:id", validate(V.attendanceUpdateValidator), Controller.updateAttendance);
router.get("/attendance/report", validate(V.attendanceReportQueryValidator), Controller.getAttendanceReport);

// ── Homework ─────────────────────────────────
router.post("/homework", validate(V.homeworkCreateValidator), Controller.createHomework);
router.get("/homework", Controller.getMyHomework);
router.get("/homework/:id", Controller.getHomeworkDetail);
router.put("/homework/:id", validate(V.homeworkUpdateValidator), Controller.updateHomework);
router.delete("/homework/:id", Controller.deleteHomework);
router.get("/homework/:id/submissions", Controller.getHomeworkSubmissions);
router.post("/homework/:id/grade", validate(V.gradeSubmissionValidator), Controller.gradeSubmission);

// ── Marks ────────────────────────────────────
router.post("/marks", validate(V.marksCreateValidator), Controller.enterMarks);
router.get("/marks", Controller.getMyMarks);
router.put("/marks/:id", validate(V.marksUpdateValidator), Controller.updateMark);
router.get("/marks/class/:classId", Controller.getClassMarksSheet);

// ── Q&A ──────────────────────────────────────
router.get("/qa", Controller.getQuestions);
router.post("/qa/:id/answer", validate(V.answerQuestionValidator), Controller.answerQuestion);
router.get("/qa/public", Controller.getPublicQA);

// ── Reports ──────────────────────────────────
router.get("/report-requests", Controller.getPendingReports);
router.post("/report/:requestId/generate", validate(V.generateReportValidator), Controller.generateReport);
router.get("/reports", Controller.getGeneratedReports);

// ── Messages ─────────────────────────────────
router.get("/messages", Controller.getMessages);
router.post("/messages", validate(V.sendMessageValidator), Controller.sendMessage);
router.get("/messages/:threadId", Controller.getConversation);

// ── Notifications ────────────────────────────
router.post("/notifications/class", validate(V.notifyClassValidator), Controller.notifyClass);
router.post("/notifications/student", validate(V.notifyStudentValidator), Controller.notifyStudent);
router.post("/notifications/parents", validate(V.notifyClassValidator), Controller.notifyParents);

export default router;
