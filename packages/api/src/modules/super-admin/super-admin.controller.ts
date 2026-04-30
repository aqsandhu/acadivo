/**
 * @file src/modules/super-admin/super-admin.controller.ts
 * @description Super Admin HTTP controllers for platform management.
 */

import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { successResponse } from "../../utils/ApiResponse";
import * as service from "./super-admin.service";

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const result = await service.getDashboardStats();
  res.status(200).json(successResponse(result, "Dashboard stats retrieved"));
});

export const listSchools = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.listSchools({
    status: req.query.status as any,
    city: req.query.city as string | undefined,
    plan: req.query.plan as any,
    search: req.query.search as string | undefined,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(successResponse(result.data, "Schools retrieved", result.meta));
});

export const getSchool = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getSchoolById(req.params.id);
  res.status(200).json(successResponse(result, "School retrieved"));
});

export const onboardSchool = asyncHandler(async (req: Request, res: Response) => {
  const createdBy = req.user?.userId!;
  const logoFile = (req as (Request & { file?: any })).file;
  const result = await service.onboardSchool({ ...req.body, logoFile }, createdBy);
  res.status(201).json(successResponse(result, "School onboarded successfully"));
});

export const updateSchool = asyncHandler(async (req: Request, res: Response) => {
  const logoFile = (req as (Request & { file?: any })).file;
  const result = await service.updateSchool(req.params.id, { ...req.body, logoFile });
  res.status(200).json(successResponse(result, "School updated successfully"));
});

export const updateSchoolStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.updateSchoolStatus(req.params.id, req.body.status);
  res.status(200).json(successResponse(result, "School status updated"));
});

export const deleteSchool = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.softDeleteSchool(req.params.id);
  res.status(200).json(successResponse(result, result.message));
});

export const listSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.listSubscriptions(
    Number(req.query.page) || 1,
    Number(req.query.limit) || 20
  );
  res.status(200).json(successResponse(result.data, "Subscriptions retrieved", result.meta));
});

export const updateSubscription = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.updateSubscription(req.params.id, req.body);
  res.status(200).json(successResponse(result, "Subscription updated"));
});

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getPlatformAnalytics(req.query.period as any || "30d");
  res.status(200).json(successResponse(result, "Analytics retrieved"));
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.listAllUsers({
    role: req.query.role as any,
    tenantId: req.query.tenantId as string | undefined,
    search: req.query.search as string | undefined,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(successResponse(result.data, "Users retrieved", result.meta));
});

export const createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const postedBy = req.user?.userId!;
  const result = await service.createSystemAnnouncement(req.body, postedBy);
  res.status(201).json(successResponse(result, "Announcement created"));
});

export const listAds = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.listAds(
    Number(req.query.page) || 1,
    Number(req.query.limit) || 20,
    req.query.status as any
  );
  res.status(200).json(successResponse(result.data, "Advertisements retrieved", result.meta));
});

export const createAd = asyncHandler(async (req: Request, res: Response) => {
  const creatorId = req.user?.userId!;
  const imageFile = (req as (Request & { file?: any })).file;
  const result = await service.createAd({ ...req.body, imageFile }, creatorId);
  res.status(201).json(successResponse(result, "Advertisement created"));
});

export const updateAd = asyncHandler(async (req: Request, res: Response) => {
  const imageFile = (req as (Request & { file?: any })).file;
  const result = await service.updateAd(req.params.id, { ...req.body, imageFile });
  res.status(200).json(successResponse(result, "Advertisement updated"));
});

export const deleteAd = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.deleteAd(req.params.id);
  res.status(200).json(successResponse(result, result.message));
});

export const getAdStats = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getAdStats(req.params.id);
  res.status(200).json(successResponse(result, "Ad stats retrieved"));
});

export const toggleAd = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.toggleAdStatus(req.params.id);
  res.status(200).json(successResponse(result, result.message));
});

// ── Bulk User Creation ──

export const bulkCreateUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.bulkCreateUsers(req.body.users);
  res.status(201).json(successResponse(result, `${result.success} users created, ${result.failed} failed`));
});

// ── System-wide Settings ──

export const getSystemSettings = asyncHandler(async (_req: Request, res: Response) => {
  const result = await service.getSystemSettings();
  res.status(200).json(successResponse(result, "System settings retrieved"));
});

export const updateSystemSetting = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.updateSystemSetting(req.body.key, req.body.value, req.body.category);
  res.status(200).json(successResponse(result, "System setting updated"));
});

export const deleteSystemSetting = asyncHandler(async (req: Request, res: Response) => {
  await service.deleteSystemSetting(req.params.key);
  res.status(200).json(successResponse(null, "System setting deleted"));
});
