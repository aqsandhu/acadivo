/**
 * @file src/modules/auth/auth.validator.ts
 * @description Joi validators for auth endpoints.
 */

import Joi from "joi";
import { TenantType, SubscriptionPlan, UserGender } from "@prisma/client";

const passwordRules = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[A-Z]/, "uppercase")
  .pattern(/[a-z]/, "lowercase")
  .pattern(/[0-9]/, "number")
  .required();

export const registerValidator = Joi.object({
  schoolName: Joi.string().min(2).max(200).required(),
  schoolCode: Joi.string().min(2).max(50).required(),
  schoolType: Joi.string().valid(...Object.values(TenantType)).required(),
  city: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(5).max(500).required(),
  schoolPhone: Joi.string().min(7).max(20).required(),
  schoolEmail: Joi.string().email().required(),
  principalFirstName: Joi.string().min(2).max(100).required(),
  principalLastName: Joi.string().min(2).max(100).required(),
  principalEmail: Joi.string().email().required(),
  principalPhone: Joi.string().min(7).max(20).required(),
  principalPassword: passwordRules,
  principalCNIC: Joi.string().min(13).max(15).optional(),
  principalGender: Joi.string().valid(...Object.values(UserGender)).optional(),
  subscriptionPlan: Joi.string().valid(...Object.values(SubscriptionPlan)).optional(),
});

export const loginValidator = Joi.object({
  uniqueId: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(1).required(),
}).xor("uniqueId", "email");

export const refreshValidator = Joi.object({
  refreshToken: Joi.string().required(),
});

export const logoutValidator = Joi.object({
  refreshToken: Joi.string().required(),
});

export const forgotPasswordValidator = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordValidator = Joi.object({
  token: Joi.string().required(),
  newPassword: passwordRules,
});

export const changePasswordValidator = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordRules,
});

export const verifyOTPValidator = Joi.object({
  phone: Joi.string().min(7).max(20).required(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
});

export const resendOTPValidator = Joi.object({
  phone: Joi.string().min(7).max(20).required(),
});

export const setup2FAValidator = Joi.object({});

export const verify2FAValidator = Joi.object({
  code: Joi.string().length(6).required(),
  tempToken: Joi.string().optional(),
});

export const updateProfileValidator = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().min(7).max(20).optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().max(500).optional(),
  city: Joi.string().max(100).optional(),
  gender: Joi.string().valid(...Object.values(UserGender)).optional(),
});

export const setupParentPasswordValidator = Joi.object({
  phone: Joi.string().min(7).max(20).required(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  newPassword: passwordRules,
});
