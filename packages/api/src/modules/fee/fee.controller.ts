import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../lib/asyncHandler";
import * as feeService from "./fee.service";

// ──────────────────────────────────────────────
// Fee Structures
// ──────────────────────────────────────────────

export const getFeeStructures = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await feeService.getFeeStructures(
    tenantId,
    req.query.academicYear as string,
    req.query.classId as string
  );
  return ApiResponse.success(res, result, "Fee structures fetched");
});

export const getFeeStructureById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await feeService.getFeeStructureById(req.params.id, tenantId);
  return ApiResponse.success(res, result, "Fee structure fetched");
});

export const createFeeStructure = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await feeService.createFeeStructure(tenantId, req.body);
  return ApiResponse.success(res, result, "Fee structure created", 201);
});

export const updateFeeStructure = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await feeService.updateFeeStructure(req.params.id, tenantId, req.body);
  return ApiResponse.success(res, result, "Fee structure updated");
});

export const deactivateFeeStructure = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await feeService.deactivateFeeStructure(req.params.id, tenantId);
  return ApiResponse.success(res, result, "Fee structure deactivated");
});

// ──────────────────────────────────────────────
// Fee Records
// ──────────────────────────────────────────────

export const getFeeRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const userRole = req.user!.role;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  // Parents can only see their own children's records
  let studentId: string | undefined;
  if (userRole === "PARENT") {
    studentId = req.query.studentId as string;
  }

  const result = await feeService.getFeeRecords(tenantId, {
    studentId: studentId || (req.query.studentId as string),
    status: req.query.status as any,
    academicYear: req.query.academicYear as string,
    page,
    pageSize,
  });

  return ApiResponse.paginated(res, result.records, page, pageSize, result.totalCount, "Fee records fetched");
});

export const getFeeRecordById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await feeService.getFeeRecordById(req.params.id, tenantId);
  return ApiResponse.success(res, result, "Fee record fetched");
});

export const createFeeRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await feeService.createFeeRecord(tenantId, req.body);
  return ApiResponse.success(res, result, "Fee record created", 201);
});

export const updateFeeRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await feeService.updateFeeRecord(req.params.id, tenantId, req.body);
  return ApiResponse.success(res, result, "Fee record updated");
});

export const recordPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await feeService.recordPayment(req.params.id, tenantId, req.body);
  return ApiResponse.success(res, result, "Payment recorded");
});

export const getDefaulters = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  const result = await feeService.getDefaulters(tenantId, {
    classId: req.query.classId as string,
    daysOverdue: req.query.daysOverdue ? parseInt(req.query.daysOverdue as string) : undefined,
    page,
    pageSize,
  });

  return ApiResponse.paginated(res, result.records, page, pageSize, result.totalCount, "Defaulters fetched");
});

export const getFeeSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await feeService.getFeeSummary(tenantId, req.query.academicYear as string);
  return ApiResponse.success(res, result, "Fee summary fetched");
});

// ──────────────────────────────────────────────
// Installments
// ──────────────────────────────────────────────

export const createInstallments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await feeService.createInstallments(req.params.id, tenantId, req.body);
  return ApiResponse.success(res, result, "Installments created", 201);
});

export const getInstallments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const result = await feeService.getInstallments(req.params.id, tenantId);
  return ApiResponse.success(res, result, "Installments fetched");
});
