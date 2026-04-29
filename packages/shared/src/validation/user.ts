/**
 * User validation schemas
 */

import { z } from "zod";
import { emailSchema, phoneSchema, paginationSchema } from "./common";

export const createUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(2).max(100),
  role: z.enum(["ADMIN", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"]),
  tenantId: z.string().uuid().optional(),
  phone: phoneSchema.optional(),
  avatar: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema.partial().omit({ email: true });

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: phoneSchema.optional(),
  avatar: z.string().url().optional(),
  address: z.string().max(500).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});

export const userQuerySchema = z.object({
  ...paginationSchema.shape,
  role: z.enum(["ADMIN", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"]).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});
