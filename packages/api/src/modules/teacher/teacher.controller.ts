// ─────────────────────────────────────────────
// Teacher Controller — Route handlers for teacher academic APIs
// ─────────────────────────────────────────────

import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { ApiResponse } from "../../lib/ApiResponse";
import { ApiError } from "../../lib/ApiError";
import { asyncHandler } from "../../lib/asyncHandler";
import * as TeacherService from "./teacher.service";

// ── Dashboard ─────────────────────────────────

export const getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await TeacherService.getTeacherDashboard(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "Teacher dashboard");
});

export const getMyClasses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await TeacherService.getTeacherClasses(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "My assigned classes");
});

export const getMyTimetable = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await TeacherService.getTeacherTimetable(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "My timetable");
});

// ── Attendance ────────────────────────────────

export const getClassAttendanceToday = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { classId, sectionId } = req.params;
  const result = await TeacherService.getClassAttendance(req.user!.id, req.user!.tenantId, classId, sectionId);
  return ApiResponse.success(res, result, "Class attendance today");
});

export const markAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { classId, sectionId, records } = req.body;
  const result = await TeacherService.markAttendance(req.user!.id, req.user!.tenantId, {
    classId,
    sectionId,
    records,
  });
  return ApiResponse.success(res, result, "Attendance marked", 201);
});

export const updateAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const result = await TeacherService.updateAttendance(req.user!.id, req.user!.tenantId, id, {
    status,
    remarks,
  });
  return ApiResponse.success(res, result, "Attendance updated");
});

export const getAttendanceReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { classId, sectionId, month } = req.query as { classId?: string; sectionId?: string; month?: string };
  const result = await TeacherService.getAttendanceReport(
    req.user!.id,
    req.user!.tenantId,
    classId,
    sectionId,
    month
  );
  return ApiResponse.success(res, result, "Attendance report");
});

// ── Homework ─────────────────────────────────

export const createHomework = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await TeacherService.createHomework(req.user!.id, req.user!.tenantId, req.body);
  return ApiResponse.success(res, result, "Homework created", 201);
});

export const getMyHomework = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await TeacherService.getTeacherHomework(req.user!.id, req.user!.tenantId, page, limit);
  return ApiResponse.paginated(res, result.homeworks, result.page, result.limit, result.total, "My homeworks");
});

export const getHomeworkDetail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await TeacherService.getHomeworkById(req.user!.id, req.user!.tenantId, req.params.id);
  return ApiResponse.success(res, result, "Homework details");
});

export const updateHomework = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await TeacherService.updateHomework(req.user!.id, req.user!.tenantId, req.params.id, req.body);
  return ApiResponse.success(res, result, "Homework updated");
});

export const deleteHomework = asyncHandler(async (req: AuthRequest, res: Response) => {
  await TeacherService.deleteHomework(req.user!.id, req.user!.tenantId, req.params.id);
  return ApiResponse.success(res, null, "Homework removed");
});

export const getHomeworkSubmissions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await TeacherService.getHomeworkSubmissions(req.user!.id, req.user!.tenantId, req.params.id);
  return ApiResponse.success(res, result, "Submissions");
});

export const gradeSubmission = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { submissionId, marks, feedback } = req.body;
  const result = await TeacherService.gradeSubmission(req.user!.id, req.user!.tenantId, req.params.id, {
    submissionId,
    marks,
    feedback,
  });
  return ApiResponse.success(res, result, "Submission graded");
});

// ── Marks ────────────────────────────────────

export const enterMarks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await TeacherService.enterMarks(req.user!.id, req.user!.tenantId, req.body);
  return ApiResponse.success(res, result, "Marks entered", 201);
});

export const getMyMarks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const result = await TeacherService.getTeacherMarks(req.user!.id, req.user!.tenantId, page, limit);
  return ApiResponse.paginated(res, result.marks, result.page, result.limit, result.total, "My entered marks");
});

export const updateMark = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { totalMarks, obtainedMarks, remarks } = req.body;
  const result = await TeacherService.updateMark(req.user!.id, req.user!.tenantId, req.params.id, {
    totalMarks,
    obtainedMarks,
    remarks,
  });
  return ApiResponse.success(res, result, "Marks updated");
});

export const getClassMarksSheet = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { classId } = req.params;
  const examType = req.query.examType as string | undefined;
  const result = await TeacherService.getClassMarksSheet(req.user!.id, req.user!.tenantId, classId, examType);
  return ApiResponse.success(res, result, "Class marks sheet");
});

// ── Q&A ──────────────────────────────────────

export const getQuestions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await TeacherService.getTeacherQA(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "Student questions");
});

export const answerQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { answer, isPublic, classId, sectionId } = req.body;
  const result = await TeacherService.answerQuestion(req.user!.id, req.user!.tenantId, req.params.id, {
    answer,
    isPublic,
    classId,
    sectionId,
  });
  return ApiResponse.success(res, result, "Answer posted", 201);
});

export const getPublicQA = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { classId, sectionId } = req.query as { classId?: string; sectionId?: string };
  const result = await TeacherService.getPublicQA(req.user!.id, req.user!.tenantId, classId, sectionId);
  return ApiResponse.success(res, result, "Public Q&A");
});

// ── Reports ──────────────────────────────────

export const getPendingReports = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await TeacherService.getPendingReportRequests(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "Pending report requests");
});

export const generateReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { attendancePercentage, behaviorAssessment, teacherComments, pdfUrl } = req.body;
  const result = await TeacherService.generateReport(req.user!.id, req.user!.tenantId, req.params.requestId, {
    attendancePercentage,
    behaviorAssessment,
    teacherComments,
    pdfUrl,
  });
  return ApiResponse.success(res, result, "Report generated", 201);
});

export const getGeneratedReports = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await TeacherService.getTeacherReports(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "Generated reports");
});

// ── Messages ─────────────────────────────────

export const getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await TeacherService.getTeacherMessages(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "Message threads");
});

export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { receiverId, content, attachments, messageType } = req.body;
  const result = await TeacherService.sendMessage(req.user!.id, req.user!.tenantId, {
    receiverId,
    content,
    attachments,
    messageType,
  });
  return ApiResponse.success(res, result, "Message sent", 201);
});

export const getConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await TeacherService.getConversation(req.user!.id, req.user!.tenantId, req.params.threadId);
  return ApiResponse.success(res, result, "Conversation history");
});

// ── Notifications ──────────────────────────────

export const notifyClass = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { classId, sectionId, title, body } = req.body;
  const result = await TeacherService.notifyClass(req.user!.id, req.user!.tenantId, { classId, sectionId, title, body });
  return ApiResponse.success(res, result, "Notification sent to class", 201);
});

export const notifyStudent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { studentId, title, body } = req.body;
  const result = await TeacherService.notifyStudent(req.user!.id, req.user!.tenantId, { studentId, title, body });
  return ApiResponse.success(res, result, "Notification sent to student", 201);
});

export const notifyParents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { classId, sectionId, title, body } = req.body;
  const result = await TeacherService.notifyParents(req.user!.id, req.user!.tenantId, { classId, sectionId, title, body });
  return ApiResponse.success(res, result, "Notification sent to parents", 201);
});
