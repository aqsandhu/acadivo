// ═══════════════════════════════════════════════
// Exam Controller — Route handlers for exam APIs
// ═══════════════════════════════════════════════

import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../lib/asyncHandler";
import * as ExamService from "./exam.service";

// ═══════════════════════════════════════════════
// Exam CRUD
// ═══════════════════════════════════════════════

export const getExams = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  const result = await ExamService.getExams(tenantId, {
    academicYear: req.query.academicYear as string,
    term: req.query.term as string,
    examType: req.query.examType as string,
    isActive: req.query.isActive !== undefined ? req.query.isActive === "true" : undefined,
    page,
    pageSize,
  });

  return ApiResponse.paginated(res, result.exams, page, pageSize, result.totalCount, "Exams fetched");
});

export const getExamById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await ExamService.getExamById(req.params.id, tenantId);
  return ApiResponse.success(res, result, "Exam fetched");
});

export const createExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await ExamService.createExam(tenantId, req.body);
  return ApiResponse.success(res, result, "Exam created", 201);
});

export const updateExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await ExamService.updateExam(req.params.id, tenantId, req.body);
  return ApiResponse.success(res, result, "Exam updated");
});

export const deleteExam = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await ExamService.deleteExam(req.params.id, tenantId);
  return ApiResponse.success(res, result, "Exam deleted");
});

// ═══════════════════════════════════════════════
// Exam Schedule
// ═══════════════════════════════════════════════

export const getExamSchedule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await ExamService.getExamSchedule(req.params.examId, tenantId);
  return ApiResponse.success(res, result, "Exam schedule fetched");
});

export const addExamSchedule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await ExamService.addExamSchedule(req.params.examId, tenantId, req.body);
  return ApiResponse.success(res, result, "Exam schedule added", 201);
});

export const updateExamSchedule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await ExamService.updateExamSchedule(req.params.scheduleId, tenantId, req.body);
  return ApiResponse.success(res, result, "Exam schedule updated");
});

export const deleteExamSchedule = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await ExamService.deleteExamSchedule(req.params.scheduleId, tenantId);
  return ApiResponse.success(res, result, "Exam schedule deleted");
});

// ═══════════════════════════════════════════════
// Exam Results
// ═══════════════════════════════════════════════

export const getExamResults = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 50;

  const result = await ExamService.getExamResults(req.params.examId, tenantId, {
    classId: req.query.classId as string,
    sectionId: req.query.sectionId as string,
    subjectId: req.query.subjectId as string,
    page,
    pageSize,
  });

  return ApiResponse.paginated(res, result.results, page, pageSize, result.totalCount, "Exam results fetched");
});

export const addExamResult = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await ExamService.addExamResult(req.params.examId, tenantId, req.params.scheduleId, req.body);
  return ApiResponse.success(res, result, "Exam result added", 201);
});

export const addBulkExamResults = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const { results } = req.body;
  const result = await ExamService.addBulkExamResults(req.params.examId, tenantId, req.params.scheduleId, results);
  return ApiResponse.success(res, result, "Bulk exam results processed", 201);
});

export const deleteExamResult = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await ExamService.deleteExamResult(req.params.resultId, tenantId);
  return ApiResponse.success(res, result, "Exam result deleted");
});

// ═══════════════════════════════════════════════
// Student Exam View
// ═══════════════════════════════════════════════

export const getStudentExams = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await ExamService.getStudentExams(req.user!.id, tenantId);
  return ApiResponse.success(res, result, "Student exams fetched");
});

export const getStudentExamResults = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const examId = req.query.examId as string | undefined;
  const result = await ExamService.getStudentExamResults(req.user!.id, tenantId, examId);
  return ApiResponse.success(res, result, "Student exam results fetched");
});

// ═══════════════════════════════════════════════
// Exam Statistics
// ═══════════════════════════════════════════════

export const getExamStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await ExamService.getExamStatistics(req.params.examId, tenantId);
  return ApiResponse.success(res, result, "Exam statistics fetched");
});
