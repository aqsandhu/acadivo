/**
 * @file src/modules/auth/auth.controller.ts
 * @description Auth HTTP controllers. All handlers are wrapped with asyncHandler.
 */

import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { successResponse } from "../../utils/ApiResponse";
import * as authService from "./auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerSchool(req.body);
  res.status(201).json(successResponse(result, result.message));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  if ("requires2FA" in result && result.requires2FA) {
    return res.status(200).json(successResponse(result, result.message));
  }
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
  const result = await authService.logoutUser(userId!, refreshToken);
  res.status(200).json(successResponse(result, result.message));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  res.status(200).json(successResponse(result, result.message));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body);
  res.status(200).json(successResponse(result, result.message));
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
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
    return res.status(200).json(successResponse(result, result.message));
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
  const avatarFile = (req as any).file;
  const result = await authService.updateProfile(userId, { ...req.body, avatarFile });
  res.status(200).json(successResponse(result, "Profile updated successfully"));
});

export const setupParentPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.setupParentPassword(req.body);
  res.status(200).json(successResponse(result, result.message));
});
