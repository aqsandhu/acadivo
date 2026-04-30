/**
 * Shared validation schemas exported by @acadivo/shared
 * Uses Zod for runtime validation.
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

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2).max(100),
});

// Re-export all validation modules
export * from "./common";
export * from "./auth";
export * from "./user";
export * from "./school";
export * from "./class";
export * from "./fee";
export * from "./attendance";
export * from "./homework";
export * from "./timetable";
export * from "./message";
export * from "./notification";
export * from "./report";
export * from "./result";
export * from "./advertisement";
export * from "./pakistan";
