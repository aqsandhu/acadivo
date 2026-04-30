// ═══════════════════════════════════════════════
// Mark / Gradebook Controller — Route handlers for mark APIs
// ═══════════════════════════════════════════════

import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import * as MarkService from "./mark.service";

// ── Marks CRUD ──

export const getMarks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 50;
  const result = await MarkService.getMarks(tenantId, {
    classId: req.query.classId as string,
    sectionId: req.query.sectionId as string,
    subjectId: req.query.subjectId as string,
    studentId: req.query.studentId as string,
    examType: req.query.examType as string,
    academicYear: req.query.academicYear as string,
    page,
    pageSize,
  });
  return ApiResponse.paginated(res, result.marks, page, pageSize, result.totalCount, "Marks fetched");
});

export const updateMark = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await MarkService.updateMark(req.params.id, tenantId, req.body);
  return ApiResponse.success(res, result, "Mark updated");
});

// ── Bulk Entry ──

export const createBulkMarks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await MarkService.createBulkMarks(tenantId, req.user!.id, req.body.marks);
  return ApiResponse.success(res, result, "Bulk marks entered", 201);
});

// ── Student Marks ──

export const getStudentMarks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await MarkService.getStudentMarks(req.params.studentId, tenantId, {
    academicYear: req.query.academicYear as string,
    examType: req.query.examType as string,
  });
  return ApiResponse.success(res, result, "Student marks fetched");
});

// ── Calculate Result ──

export const calculateResult = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await MarkService.calculateCompiledResult(tenantId, req.user!.id, req.body);
  return ApiResponse.success(res, result, "Result calculated", 201);
});
