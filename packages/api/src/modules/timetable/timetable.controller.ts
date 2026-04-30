// ═══════════════════════════════════════════════
// Timetable Controller — Route handlers for timetable APIs
// ═══════════════════════════════════════════════

import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import * as TimetableService from "./timetable.service";

// ── Timetable CRUD ──

export const getTimetable = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await TimetableService.getTimetable(tenantId, {
    classId: req.query.classId as string,
    sectionId: req.query.sectionId as string,
    teacherId: req.query.teacherId as string,
    dayOfWeek: req.query.dayOfWeek ? parseInt(req.query.dayOfWeek as string) : undefined,
    academicYear: req.query.academicYear as string,
  });
  return ApiResponse.success(res, result, "Timetable fetched");
});

export const createSchedule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await TimetableService.createSchedule(tenantId, req.body);
  return ApiResponse.success(res, result, "Schedule created", 201);
});

export const updateSchedule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await TimetableService.updateSchedule(req.params.id, tenantId, req.body);
  return ApiResponse.success(res, result, "Schedule updated");
});

export const deleteSchedule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  await TimetableService.deleteSchedule(req.params.id, tenantId);
  return ApiResponse.success(res, null, "Schedule deleted");
});

// ── Bulk ──

export const createBulkSchedules = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await TimetableService.createBulkSchedules(tenantId, req.body.schedules);
  return ApiResponse.success(res, result, "Bulk schedules created", 201);
});

// ── Teacher Timetable ──

export const getTeacherTimetable = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await TimetableService.getTeacherTimetable(req.params.teacherId, tenantId);
  return ApiResponse.success(res, result, "Teacher timetable fetched");
});

// ── Conflicts ──

export const getConflicts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await TimetableService.detectConflicts(tenantId, {
    classId: req.query.classId as string,
    sectionId: req.query.sectionId as string,
    teacherId: req.query.teacherId as string,
    dayOfWeek: req.query.dayOfWeek ? parseInt(req.query.dayOfWeek as string) : undefined,
  });
  return ApiResponse.success(res, result, "Conflicts detected");
});
