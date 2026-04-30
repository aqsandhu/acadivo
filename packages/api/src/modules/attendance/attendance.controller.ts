// ═══════════════════════════════════════════════
// Attendance Controller — Route handlers for attendance APIs
// ═══════════════════════════════════════════════

import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import * as AttendanceService from "./attendance.service";

// ── Attendance CRUD ──

export const getAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 50;
  const result = await AttendanceService.getAttendance(tenantId, {
    classId: req.query.classId as string,
    sectionId: req.query.sectionId as string,
    studentId: req.query.studentId as string,
    date: req.query.date as string,
    status: req.query.status as string,
    page,
    pageSize,
  });
  return ApiResponse.paginated(res, result.records, page, pageSize, result.totalCount, "Attendance records fetched");
});

export const markAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await AttendanceService.markAttendance(tenantId, req.user!.id, req.body);
  return ApiResponse.success(res, result, "Attendance marked", 201);
});

export const markBulkAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await AttendanceService.markBulkAttendance(tenantId, req.user!.id, req.body);
  return ApiResponse.success(res, result, "Bulk attendance marked", 201);
});

export const updateAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await AttendanceService.updateAttendance(req.params.id, tenantId, req.user!.id, req.body);
  return ApiResponse.success(res, result, "Attendance updated");
});

// ── Student Attendance ──

export const getStudentAttendance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await AttendanceService.getStudentAttendance(req.params.studentId, tenantId, {
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
  });
  return ApiResponse.success(res, result, "Student attendance fetched");
});

// ── Summary ──

export const getAttendanceSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await AttendanceService.getAttendanceSummary(tenantId, {
    classId: req.query.classId as string,
    sectionId: req.query.sectionId as string,
    month: req.query.month as string,
  });
  return ApiResponse.success(res, result, "Attendance summary fetched");
});

// ── Alerts ──

export const getAlerts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await AttendanceService.getAlerts(tenantId, {
    isResolved: req.query.isResolved !== undefined ? req.query.isResolved === "true" : undefined,
    studentId: req.query.studentId as string,
  });
  return ApiResponse.success(res, result, "Attendance alerts fetched");
});

export const resolveAlert = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await AttendanceService.resolveAlert(req.params.id, tenantId, req.user!.id);
  return ApiResponse.success(res, result, "Alert resolved");
});
