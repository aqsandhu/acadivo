/**
 * Common validation schemas (Zod)
 */

import { z } from "zod";

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(5, "Email too short")
  .max(255, "Email too long");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const uuidSchema = z.string().uuid("Invalid UUID format");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9\s\-]{7,20}$/, "Invalid phone number");

export const urlSchema = z.string().url("Invalid URL").optional();

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});
