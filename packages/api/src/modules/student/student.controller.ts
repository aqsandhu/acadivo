// ─────────────────────────────────────────────
// Student Controller — Route handlers for student academic APIs
// ─────────────────────────────────────────────

import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { ApiResponse } from "../../lib/ApiResponse";
import { asyncHandler } from "../../lib/asyncHandler";
import * as StudentService from "./student.service";

// ── Dashboard & Profile ───────────────────────

export const getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await StudentService.getStudentDashboard(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "Student dashboard");
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await StudentService.getStudentProfile(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "Student profile");
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { avatar, address, phone } = req.body;
  const result = await StudentService.updateStudentProfile(req.user!.id, req.user!.tenantId, {
    avatar,
    address,
    phone,
  });
  return ApiResponse.success(res, result, "Profile updated");
});

// ── Attendance ────────────────────────────────

export const getAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const month = req.query.month as string | undefined;
  const result = await StudentService.getStudentAttendance(req.user!.id, req.user!.tenantId, month);
  return ApiResponse.success(res, result, "Attendance history");
});

export const getAttendanceSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await StudentService.getStudentAttendanceSummary(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "Attendance summary");
});

// ── Homework ─────────────────────────────────

export const getPendingHomework = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await StudentService.getPendingHomework(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "Pending homework");
});

export const getHomeworkDetail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await StudentService.getHomeworkDetail(req.user!.id, req.user!.tenantId, req.params.id);
  return ApiResponse.success(res, result, "Homework details");
});

export const submitHomework = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { submissionText, attachments } = req.body;
  const result = await StudentService.submitHomework(req.user!.id, req.user!.tenantId, req.params.id, {
    submissionText,
    attachments,
  });
  return ApiResponse.success(res, result, "Homework submitted", 201);
});

export const getMySubmissions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await StudentService.getMySubmissions(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "My submissions");
});

// ── Q&A ──────────────────────────────────────

export const askQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { teacherId, subjectId, question } = req.body;
  const result = await StudentService.askQuestion(req.user!.id, req.user!.tenantId, {
    teacherId,
    subjectId,
    question,
  });
  return ApiResponse.success(res, result, "Question sent", 201);
});

export const getMyQA = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await StudentService.getMyQA(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "My Q&A");
});

export const getPublicQA = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await StudentService.getPublicQA(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "Public Q&A");
});

// ── Results ──────────────────────────────────

export const getResults = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await StudentService.getStudentResults(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "My results");
});

export const getResultDetail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await StudentService.getResultDetail(req.user!.id, req.user!.tenantId, req.params.id);
  return ApiResponse.success(res, result, "Result detail");
});

export const getMarks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await StudentService.getStudentMarks(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "Subject-wise marks");
});

// ── Timetable ────────────────────────────────

export const getTimetable = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await StudentService.getStudentTimetable(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "My timetable");
});

// ── Notifications ────────────────────────────

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await StudentService.getStudentNotifications(req.user!.id, req.user!.tenantId, page, limit);
  return ApiResponse.paginated(res, result.notifications, result.page, result.limit, result.total, "Notifications");
});

export const markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await StudentService.markNotificationRead(req.user!.id, req.user!.tenantId, req.params.id);
  return ApiResponse.success(res, result, "Notification marked as read");
});

export const markAllNotificationsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await StudentService.markAllNotificationsRead(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, { updatedCount: result.count }, "All notifications marked as read");
});

// ── Messages ─────────────────────────────────

export const getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await StudentService.getStudentMessages(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "My messages");
});

export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { receiverId, content, attachments } = req.body;
  const result = await StudentService.sendStudentMessage(req.user!.id, req.user!.tenantId, {
    receiverId,
    content,
    attachments,
  });
  return ApiResponse.success(res, result, "Message sent", 201);
});
