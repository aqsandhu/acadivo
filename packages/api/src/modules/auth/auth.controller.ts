/**
 * @file src/modules/auth/auth.controller.ts
 * @description Auth HTTP controllers. All handlers are wrapped with asyncHandler.
 */

import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { successResponse } from "../../utils/ApiResponse";
import * as authService from "./auth.service";
import * as twoFAService from "./2fa.service";

// Simple audit logger
function auditLog(event: string, userId: string | undefined, details: Record<string, any> = {}) {
  console.log(`[AUDIT] ${new Date().toISOString()} | ${event} | user=${userId ?? "anonymous"} | ${JSON.stringify(details)}`);
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerSchool(req.body);
  res.status(201).json(successResponse(result, result.message));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser({
    ...req.body,
    ipAddress: req.ip || (req.headers["x-forwarded-for"] as string) || "0.0.0.0",
    userAgent: req.headers["user-agent"] || "",
  });
  if ("requires2FA" in result && result.requires2FA) {
    auditLog("LOGIN_2FA_REQUIRED", undefined, { ip: req.ip });
    return res.status(200).json(successResponse(result, result.message));
  }
  auditLog("LOGIN_SUCCESS", result.user?.id, { role: result.user?.role, tenantId: result.user?.tenantId });
  res.status(200).json(successResponse(result, result.message));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);
  res.status(200).json(successResponse(result, result.message));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const userId = req.user?.userId;
  auditLog("LOGOUT", userId, {});
  const result = await authService.logoutUser(userId!, refreshToken);
  res.status(200).json(successResponse(result, result.message));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  auditLog("PASSWORD_RESET_REQUESTED", undefined, { email });
  const result = await authService.forgotPassword(email);
  res.status(200).json(successResponse(result, result.message));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  auditLog("PASSWORD_RESET_EXECUTED", undefined, {});
  const result = await authService.resetPassword(req.body);
  res.status(200).json(successResponse(result, result.message));
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  auditLog("PASSWORD_CHANGED", userId, {});
  const result = await authService.changePassword({ ...req.body, userId });
  res.status(200).json(successResponse(result, result.message));
});

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  const result = await authService.verifyPhoneOTP(phone, otp);
  res.status(200).json(successResponse(result, result.message));
});

export const resendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.body;
  const result = await authService.resendOTP(phone);
  res.status(200).json(successResponse(result, result.message));
});

export const setup2FA = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const result = await authService.setup2FA(userId);
  res.status(200).json(successResponse(result, result.message));
});

export const verify2FA = asyncHandler(async (req: Request, res: Response) => {
  const { code, tempToken } = req.body;
  const userId = req.user?.userId;
  const result = await authService.verify2FA(userId || "", code, tempToken);
  if ("tokens" in result) {
    auditLog("LOGIN_2FA_SUCCESS", result.user?.id, { role: result.user?.role });
    return res.status(200).json(successResponse(result, result.message));
  }
  res.status(200).json(successResponse(result, result.message));
});

export const disable2FA = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  auditLog("2FA_DISABLED", userId, {});
  const { code } = req.body;
  const result = await authService.disable2FA(userId, code);
  res.status(200).json(successResponse(result, result.message));
});

export const verify2FALogin = asyncHandler(async (req: Request, res: Response) => {
  const { code, tempToken } = req.body;
  const result = await authService.verify2FA("", code, tempToken);
  if ("tokens" in result) {
    auditLog("LOGIN_2FA_SUCCESS", result.user?.id, { role: result.user?.role });
  }
  res.status(200).json(successResponse(result, result.message));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const result = await authService.getProfile(userId);
  res.status(200).json(successResponse(result, "Profile retrieved successfully"));
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const avatarFile = (req as (Request & { file?: any })).file;
  auditLog("PROFILE_UPDATED", userId, { fields: Object.keys(req.body) });
  const result = await authService.updateProfile(userId, { ...req.body, avatarFile });
  res.status(200).json(successResponse(result, "Profile updated successfully"));
});

export const setupParentPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.setupParentPassword(req.body);
  res.status(200).json(successResponse(result, result.message));
});

export const initiateParentPasswordSetup = asyncHandler(async (req: Request, res: Response) => {
  const { parentId } = req.body;
  const result = await authService.initiateParentPasswordSetup(parentId);
  res.status(200).json(successResponse(result, result.message));
});

export const verifyParentOTPAndSetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { parentId, otp, newPassword } = req.body;
  const result = await authService.verifyParentOTPAndSetPassword(parentId, otp, newPassword);
  res.status(200).json(successResponse(result, result.message));
});
