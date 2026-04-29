/**
 * @file src/modules/auth/auth.validator.ts
 * @description Zod validators for auth endpoints.
 */

import { z } from "zod";
import { TenantType, SubscriptionPlan, UserGender } from "@prisma/client";

const passwordSchema = z.string().min(8).max(128)
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain number");

export const registerValidator = z.object({
  schoolName: z.string().min(2).max(200),
  schoolCode: z.string().min(2).max(50),
  schoolType: z.nativeEnum(TenantType),
  city: z.string().min(2).max(100),
  address: z.string().min(5).max(500),
  schoolPhone: z.string().min(7).max(20),
  schoolEmail: z.string().email(),
  principalFirstName: z.string().min(2).max(100),
  principalLastName: z.string().min(2).max(100),
  principalEmail: z.string().email(),
  principalPhone: z.string().min(7).max(20),
  principalPassword: passwordSchema,
  principalCNIC: z.string().min(13).max(15).optional(),
  principalGender: z.nativeEnum(UserGender).optional(),
  subscriptionPlan: z.nativeEnum(SubscriptionPlan).optional(),
});

export const loginValidator = z.object({
  uniqueId: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(1),
}).refine((data) => data.uniqueId || data.email, {
  message: "Either uniqueId or email is required",
  path: ["uniqueId"],
});

export const refreshValidator = z.object({
  refreshToken: z.string().min(1),
});

export const logoutValidator = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordValidator = z.object({
  email: z.string().min(1),
});

export const resetPasswordValidator = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});

export const changePasswordValidator = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const verifyOTPValidator = z.object({
  phone: z.string().min(7).max(20),
  otp: z.string().length(6).regex(/^[0-9]+$/),
});

export const resendOTPValidator = z.object({
  phone: z.string().min(7).max(20),
});

export const setup2FAValidator = z.object({}).optional();

export const verify2FAValidator = z.object({
  code: z.string().length(6),
  tempToken: z.string().optional(),
});

export const disable2FAValidator = z.object({
  code: z.string().length(6),
});

export const updateProfileValidator = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  phone: z.string().min(7).max(20).optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  gender: z.nativeEnum(UserGender).optional(),
});

export const setupParentPasswordValidator = z.object({
  phone: z.string().min(7).max(20),
  otp: z.string().length(6).regex(/^[0-9]+$/),
  newPassword: passwordSchema,
});
