import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { ApiResponse } from "../../lib/ApiResponse";
import { asyncHandler } from "../../lib/asyncHandler";
import * as adService from "./advertisement.service";

// ──────────────────────────────────────────────
// Public Ad Endpoints
// ──────────────────────────────────────────────

export const getActiveAds = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userRole = req.user!.role;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  const result = await adService.getActiveAds(
    userRole,
    req.query.city as string,
    req.query.schoolType as string,
    page,
    pageSize
  );

  return ApiResponse.paginated(res, result.ads, page, pageSize, result.totalCount, "Active ads fetched");
});

export const getAdById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const ad = await adService.getAdById(req.params.id);
  return ApiResponse.success(res, ad, "Ad fetched");
});

export const trackImpression = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const tenantId = req.user!.tenantId || (req.body.tenantId as string);
  const result = await adService.trackImpression(
    req.params.id,
    userId,
    tenantId,
    req.body.studentId as string
  );
  return ApiResponse.success(res, result, "Impression tracked");
});

export const trackClick = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const tenantId = req.user!.tenantId || (req.body.tenantId as string);
  const result = await adService.trackClick(
    req.params.id,
    userId,
    tenantId,
    req.body.studentId as string
  );
  return ApiResponse.success(res, result, "Click tracked");
});

// ──────────────────────────────────────────────
// Super Admin Ad Management Endpoints
// ──────────────────────────────────────────────

export const getAllAds = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;

  const result = await adService.getAllAds({
    status: req.query.status as any,
    search: req.query.search as string,
    page,
    pageSize,
  });

  return ApiResponse.paginated(res, result.ads, page, pageSize, result.totalCount, "All ads fetched");
});

export const createAd = asyncHandler(async (req: AuthRequest, res: Response) => {
  const createdBy = req.user!.id;
  const result = await adService.createAd(createdBy, req.body);
  return ApiResponse.success(res, result, "Ad created", 201);
});

export const updateAd = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await adService.updateAd(req.params.id, req.body);
  return ApiResponse.success(res, result, "Ad updated");
});

export const deleteAd = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await adService.deleteAd(req.params.id);
  return ApiResponse.success(res, result, "Ad deleted");
});

export const updateAdStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await adService.updateAdStatus(req.params.id, req.body.status);
  return ApiResponse.success(res, result, "Ad status updated");
});

export const getAdStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await adService.getAdStats(req.params.id);
  return ApiResponse.success(res, result, "Ad stats fetched");
});
