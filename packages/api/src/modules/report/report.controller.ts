import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../lib/asyncHandler";
import * as reportService from "./report.service";

// ──────────────────────────────────────────────
// Report Requests
// ──────────────────────────────────────────────

export const createReportRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const parentId = req.user!.id;
  const result = await reportService.createReportRequest(tenantId, parentId, req.body);
  return ApiResponse.success(res, result, "Report request created", 201);
});

export const getReportRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  const result = await reportService.getReportRequests(tenantId, userId, userRole, {
    status: req.query.status as any,
    page,
    pageSize,
  });

  return ApiResponse.paginated(res, result.requests, page, pageSize, result.totalCount, "Report requests fetched");
});

export const generateReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const teacherId = req.user!.id;
  const result = await reportService.generateReport(req.params.requestId, tenantId, teacherId, req.body);
  return ApiResponse.success(res, result, "Report generated");
});

export const getReportById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const request = await reportService.getReportRequestById(req.params.id, tenantId);
  return ApiResponse.success(res, request, "Report fetched");
});

export const getGeneratedReports = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const userRole = req.user!.role;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  const filters: { parentId?: string; studentId?: string; page: number; pageSize: number } = {
    page,
    pageSize,
    studentId: req.query.studentId as string,
  };

  if (userRole === "PARENT") {
    filters.parentId = req.user!.id;
  }

  const result = await reportService.getGeneratedReports(tenantId, filters);
  return ApiResponse.paginated(res, result.reports, page, pageSize, result.totalCount, "Generated reports fetched");
});

// ──────────────────────────────────────────────
// Report Templates
// ──────────────────────────────────────────────

export const getReportTemplates = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await reportService.getReportTemplates(tenantId);
  return ApiResponse.success(res, result, "Report templates fetched");
});

export const createReportTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await reportService.createReportTemplate(tenantId, req.body);
  return ApiResponse.success(res, result, "Report template created", 201);
});

export const generateProgressReportPDF = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await reportService.generateProgressReport(req.params.id);
  return ApiResponse.success(res, result, "Progress report generated and uploaded");
});
