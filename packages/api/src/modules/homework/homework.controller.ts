// ═══════════════════════════════════════════════
// Homework Controller — Route handlers for homework APIs
// ═══════════════════════════════════════════════

import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import * as HomeworkService from "./homework.service";

// ── Homework CRUD ──

export const getHomeworks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const result = await HomeworkService.getHomeworks(tenantId, {
    classId: req.query.classId as string,
    sectionId: req.query.sectionId as string,
    subjectId: req.query.subjectId as string,
    teacherId: req.query.teacherId as string,
    status: req.query.status as string,
    page,
    pageSize,
  });
  return ApiResponse.paginated(res, result.homeworks, page, pageSize, result.totalCount, "Homeworks fetched");
});

export const getHomeworkById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await HomeworkService.getHomeworkById(req.params.id, tenantId);
  return ApiResponse.success(res, result, "Homework fetched");
});

export const createHomework = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await HomeworkService.createHomework(tenantId, req.user!.id, req.body);
  return ApiResponse.success(res, result, "Homework created", 201);
});

export const updateHomework = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await HomeworkService.updateHomework(req.params.id, tenantId, req.user!.id, req.body);
  return ApiResponse.success(res, result, "Homework updated");
});

export const deleteHomework = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  await HomeworkService.deleteHomework(req.params.id, tenantId, req.user!.id);
  return ApiResponse.success(res, null, "Homework deleted");
});

// ── Submissions ──

export const getHomeworkSubmissions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await HomeworkService.getHomeworkSubmissions(req.params.id, tenantId);
  return ApiResponse.success(res, result, "Submissions fetched");
});

export const submitHomework = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await HomeworkService.submitHomework(req.params.id, tenantId, req.user!.id, req.body);
  return ApiResponse.success(res, result, "Homework submitted", 201);
});

export const gradeSubmission = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await HomeworkService.gradeSubmission(req.params.id, tenantId, req.user!.id, req.body);
  return ApiResponse.success(res, result, "Submission graded");
});
