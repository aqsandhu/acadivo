/**
 * School validation schemas
 * Aligned with Prisma Tenant fields
 */

import { z } from "zod";

export const createSchoolSchema = z.object({
  name: z.string().min(2).max(200),
  code: z.string().min(2).max(100).regex(/^[a-zA-Z0-9-]+$/, "Code must be alphanumeric with hyphens"),
  type: z.enum(["SCHOOL", "COLLEGE", "UNIVERSITY"]),
  city: z.string().min(2).max(100),
  address: z.string().min(5).max(500),
  phone: z.string().min(7).max(20),
  email: z.string().email(),
  logo: z.string().url().optional(),
  subscriptionPlan: z.enum(["FREE", "BASIC", "STANDARD", "PREMIUM"]).default("FREE"),
});

export const updateSchoolSchema = createSchoolSchema.partial();

export const schoolSettingsSchema = z.object({
  timezone: z.string().default("Asia/Karachi"),
  currency: z.string().default("PKR"),
  language: z.string().default("en"),
  academicYearStart: z.coerce.date(),
  academicYearEnd: z.coerce.date(),
  gradingSystem: z.string().default("percentage"),
  attendanceMethod: z.enum(["MANUAL", "BIOMETRIC", "QR", "APP"]).default("MANUAL"),
});
