/**
 * @file src/modules/super-admin/super-admin.validator.ts
 * @description Joi validators for super-admin endpoints.
 */

import Joi from "joi";
import {
  TenantStatus,
  TenantType,
  SubscriptionPlan,
  UserRole,
  AdStatus,
  AdTargetAudience,
} from "@prisma/client";

const passwordRules = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[A-Z]/, "uppercase")
  .pattern(/[a-z]/, "lowercase")
  .pattern(/[0-9]/, "number")
  .required();

export const onboardSchoolValidator = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  code: Joi.string().min(2).max(50).required(),
  type: Joi.string().valid(...Object.values(TenantType)).required(),
  city: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(5).max(500).required(),
  phone: Joi.string().min(7).max(20).required(),
  email: Joi.string().email().required(),
  principalFirstName: Joi.string().min(2).max(100).required(),
  principalLastName: Joi.string().min(2).max(100).required(),
  principalEmail: Joi.string().email().required(),
  principalPhone: Joi.string().min(7).max(20).required(),
  principalPassword: passwordRules,
  subscriptionPlan: Joi.string().valid(...Object.values(SubscriptionPlan)).required(),
  maxTeachers: Joi.number().integer().min(1).optional(),
  maxStudents: Joi.number().integer().min(1).optional(),
});

export const updateSchoolValidator = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  city: Joi.string().min(2).max(100).optional(),
  address: Joi.string().min(5).max(500).optional(),
  phone: Joi.string().min(7).max(20).optional(),
  email: Joi.string().email().optional(),
  subscriptionPlan: Joi.string().valid(...Object.values(SubscriptionPlan)).optional(),
  maxTeachers: Joi.number().integer().min(1).optional(),
  maxStudents: Joi.number().integer().min(1).optional(),
});

export const updateSchoolStatusValidator = Joi.object({
  status: Joi.string().valid(...Object.values(TenantStatus)).required(),
});

export const updateSubscriptionValidator = Joi.object({
  plan: Joi.string().valid(...Object.values(SubscriptionPlan)).optional(),
  status: Joi.string().valid("ACTIVE", "TRIAL", "EXPIRED", "CANCELLED").optional(),
  maxTeachers: Joi.number().integer().min(1).optional(),
  maxStudents: Joi.number().integer().min(1).optional(),
  endDate: Joi.date().optional(),
});

export const listUsersValidator = Joi.object({
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
  tenantId: Joi.string().uuid().optional(),
  search: Joi.string().max(200).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const createAnnouncementValidator = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  content: Joi.string().min(5).max(5000).required(),
  priority: Joi.string().valid("LOW", "NORMAL", "HIGH", "URGENT").default("NORMAL"),
});

export const createAdValidator = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().min(5).max(1000).required(),
  targetAudience: Joi.string().valid(...Object.values(AdTargetAudience)).required(),
  linkUrl: Joi.string().uri().max(500).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  maxImpressions: Joi.number().integer().min(1).optional(),
  maxClicks: Joi.number().integer().min(1).optional(),
});

export const updateAdValidator = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  description: Joi.string().min(5).max(1000).optional(),
  targetAudience: Joi.string().valid(...Object.values(AdTargetAudience)).optional(),
  linkUrl: Joi.string().uri().max(500).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  maxImpressions: Joi.number().integer().min(1).optional(),
  maxClicks: Joi.number().integer().min(1).optional(),
  status: Joi.string().valid(...Object.values(AdStatus)).optional(),
});

export const updateSystemSettingValidator = Joi.object({
  key: Joi.string().min(1).max(100).required(),
  value: Joi.string().max(2000).required(),
  category: Joi.string().valid("GENERAL", "ACADEMIC", "FEE", "COMMUNICATION", "NOTIFICATION").default("GENERAL"),
});
