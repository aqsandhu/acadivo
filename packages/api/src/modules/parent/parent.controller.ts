// ─────────────────────────────────────────────
// Parent Controller — Route handlers for parent academic APIs
// ─────────────────────────────────────────────

import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../lib/asyncHandler";
import * as ParentService from "./parent.service";

// ── Dashboard & Children ─────────────────────

export const getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ParentService.getParentDashboard(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "Parent dashboard");
});

export const getChildren = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ParentService.getMyChildren(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "My children");
});

export const getChildDetail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ParentService.getChildDetail(req.user!.id, req.user!.tenantId, req.params.studentId);
  return ApiResponse.success(res, result, "Child details");
});

// ── Attendance ────────────────────────────────

export const getChildAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const month = req.query.month as string | undefined;
  const result = await ParentService.getChildAttendance(req.user!.id, req.user!.tenantId, req.params.studentId, month);
  return ApiResponse.success(res, result, "Child attendance");
});

export const getChildAttendanceSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ParentService.getChildAttendanceSummary(req.user!.id, req.user!.tenantId, req.params.studentId);
  return ApiResponse.success(res, result, "Child attendance summary");
});

// ── Homework ─────────────────────────────────

export const getChildHomework = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ParentService.getChildHomework(req.user!.id, req.user!.tenantId, req.params.studentId);
  return ApiResponse.success(res, result, "Child homework");
});

// ── Results & Marks ──────────────────────────

export const getChildResults = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ParentService.getChildResults(req.user!.id, req.user!.tenantId, req.params.studentId);
  return ApiResponse.success(res, result, "Child results");
});

export const getChildMarks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ParentService.getChildMarks(req.user!.id, req.user!.tenantId, req.params.studentId);
  return ApiResponse.success(res, result, "Child marks");
});

// ── Report Requests ──────────────────────────

export const createReportRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { studentId, teacherId, reportType } = req.body;
  const result = await ParentService.createReportRequest(req.user!.id, req.user!.tenantId, {
    studentId,
    teacherId,
    reportType,
  });
  return ApiResponse.success(res, result, "Report requested", 201);
});

export const getReportRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ParentService.getMyReportRequests(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "My report requests");
});

export const getReportRequestDetail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ParentService.getReportRequestDetail(req.user!.id, req.user!.tenantId, req.params.id);
  return ApiResponse.success(res, result, "Report request detail");
});

// ── Q&A ──────────────────────────────────────

export const askQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { teacherId, question } = req.body;
  const result = await ParentService.askQuestion(req.user!.id, req.user!.tenantId, { teacherId, question });
  return ApiResponse.success(res, result, "Question sent", 201);
});

export const getMyQA = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ParentService.getMyQA(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "My Q&A history");
});

// ── Fee ─────────────────────────────────────

export const getFeeRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ParentService.getFeeRecords(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "Fee records");
});

export const getFeeRecordDetail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ParentService.getFeeRecordDetail(req.user!.id, req.user!.tenantId, req.params.id);
  return ApiResponse.success(res, result, "Fee record detail");
});

export const getFeeDue = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ParentService.getFeeDue(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "Upcoming fee due");
});

// ── Messages ─────────────────────────────────

export const getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ParentService.getParentMessages(req.user!.id, req.user!.tenantId);
  return ApiResponse.success(res, result, "My messages");
});

export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { receiverId, content, attachments } = req.body;
  const result = await ParentService.sendParentMessage(req.user!.id, req.user!.tenantId, {
    receiverId,
    content,
    attachments,
  });
  return ApiResponse.success(res, result, "Message sent", 201);
});

// ── Notifications ───────────────────────────

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await ParentService.getParentNotifications(req.user!.id, req.user!.tenantId, page, limit);
  return ApiResponse.paginated(res, result.notifications, result.page, result.limit, result.total, "Notifications");
});

export const markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await ParentService.markNotificationRead(req.user!.id, req.user!.tenantId, req.params.id);
  return ApiResponse.success(res, result, "Notification marked as read");
});
