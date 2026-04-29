import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../lib/asyncHandler";
import * as resultService from "./result.service";

// ──────────────────────────────────────────────
// Results
// ──────────────────────────────────────────────

export const getStudentResults = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  const result = await resultService.getStudentResults(req.params.studentId, tenantId, {
    academicYear: req.query.academicYear as string,
    term: req.query.term as any,
    page,
    pageSize,
  });

  return ApiResponse.paginated(res, result.results, page, pageSize, result.totalCount, "Student results fetched");
});

export const getResultById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await resultService.getResultById(req.params.id, tenantId);
  return ApiResponse.success(res, result, "Result fetched");
});

export const compileResult = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await resultService.compileResult(tenantId, req.user!.id, req.body);
  return ApiResponse.success(res, result, "Result compiled", 201);
});

export const updateResult = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await resultService.updateResult(req.params.id, tenantId, req.body);
  return ApiResponse.success(res, result, "Result updated");
});

export const deleteResult = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await resultService.deleteResult(req.params.id, tenantId);
  return ApiResponse.success(res, result, "Result deleted");
});

export const getClassResults = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  const result = await resultService.getClassResults(req.params.classId, tenantId, {
    academicYear: req.query.academicYear as string,
    term: req.query.term as any,
    page,
    pageSize,
  });

  return ApiResponse.paginated(res, result.results, page, pageSize, result.totalCount, "Class results fetched");
});

export const getClassRankings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  const result = await resultService.getClassRankings(req.params.classId, tenantId, {
    academicYear: req.query.academicYear as string,
    term: req.query.term as any,
    page,
    pageSize,
  });

  return ApiResponse.paginated(res, result.rankings, page, pageSize, result.totalCount, "Class rankings fetched");
});

// ──────────────────────────────────────────────
// Grading Schemes
// ──────────────────────────────────────────────

export const getGradingSchemes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const schemes = await resultService.getGradingSchemes(tenantId);
  return ApiResponse.success(res, schemes, "Grading schemes fetched");
});

export const createGradingScheme = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const scheme = await resultService.createGradingScheme(tenantId, req.body);
  return ApiResponse.success(res, scheme, "Grading scheme created", 201);
});

export const setDefaultGradingScheme = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const scheme = await resultService.setDefaultGradingScheme(req.params.id, tenantId);
  return ApiResponse.success(res, scheme, "Default grading scheme set");
});

// ──────────────────────────────────────────────
// Marks (Admin/Principal view)
// ──────────────────────────────────────────────

export const getStudentMarks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  const result = await resultService.getStudentMarks(req.params.studentId, tenantId, {
    academicYear: req.query.academicYear as string,
    examType: req.query.examType as string,
    page,
    pageSize,
  });

  return ApiResponse.paginated(res, result.marks, page, pageSize, result.totalCount, "Student marks fetched");
});

export const getClassMarks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  const result = await resultService.getClassMarks(req.params.classId, tenantId, {
    sectionId: req.query.sectionId as string,
    subjectId: req.query.subjectId as string,
    examType: req.query.examType as string,
    academicYear: req.query.academicYear as string,
    page,
    pageSize,
  });

  return ApiResponse.paginated(res, result.marks, page, pageSize, result.totalCount, "Class marks fetched");
});

export const getMarksAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await resultService.getMarksAnalysis(tenantId, {
    classId: req.query.classId as string,
    subjectId: req.query.subjectId as string,
    academicYear: req.query.academicYear as string,
    examType: req.query.examType as string,
  });
  return ApiResponse.success(res, result, "Marks analysis fetched");
});
