// ═══════════════════════════════════════════════
// Import Controller — Route handlers for bulk import APIs
// ═══════════════════════════════════════════════

import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { parseCSV, importStudents, importTeachers } from "../../utils/bulkImport";
import { ApiError } from "../../utils/ApiError";

export const importStudentsCSV = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const csvText = req.body.csv || "";
  if (!csvText) throw ApiError.badRequest("CSV content is required");

  const rows = parseCSV(csvText);
  const result = await importStudents(tenantId, rows as any, req.body.defaultPassword);
  return ApiResponse.success(res, result, "Students imported");
});

export const importTeachersCSV = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const csvText = req.body.csv || "";
  if (!csvText) throw ApiError.badRequest("CSV content is required");

  const rows = parseCSV(csvText);
  const result = await importTeachers(tenantId, rows as any, req.body.defaultPassword);
  return ApiResponse.success(res, result, "Teachers imported");
});

export const importParentsCSV = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tenantId = req.user!.tenantId!;
  const csvText = req.body.csv || "";
  if (!csvText) throw ApiError.badRequest("CSV content is required");

  // Parents can be imported via a CSV with student links
  const rows = parseCSV(csvText);
  const { importParents } = await import("../../utils/bulkImport");
  const result = await importParents(tenantId, rows as any);
  return ApiResponse.success(res, result, "Parents imported");
});
