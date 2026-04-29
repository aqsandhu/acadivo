/**
 * School validation schemas
 */

import { z } from "zod";

export const createSchoolSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  email: z.string().email(),
  website: z.string().url().optional(),
  subscriptionTier: z.enum(["FREE", "BASIC", "STANDARD", "PREMIUM"]).default("FREE"),
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
