/**
 * User validation schemas
 */

import { z } from "zod";
import { emailSchema, phoneSchema, paginationSchema } from "./common";
import { cnicOptionalSchema } from "./pakistan";

export const createUserSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"]),
  tenantId: z.string().uuid().optional(),
  phone: phoneSchema.optional(),
  avatar: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema.partial().omit({ email: true });

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  phone: phoneSchema.optional(),
  avatar: z.string().url().optional(),
  address: z.string().max(500).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  cnic: cnicOptionalSchema,
});

export const createParentSchema = z.object({
  email: emailSchema,
  name: z.string().min(2).max(100),
  phone: phoneSchema.optional(),
  cnic: cnicOptionalSchema,
  address: z.string().max(500).optional(),
  tenantId: z.string().uuid(),
});

export const createAdminSchema = z.object({
  email: emailSchema,
  name: z.string().min(2).max(100),
  phone: phoneSchema.optional(),
  cnic: cnicOptionalSchema,
  tenantId: z.string().uuid(),
  department: z.string().max(200).optional(),
  permissions: z.array(z.string()).optional(),
});

export const userQuerySchema = z.object({
  ...paginationSchema.shape,
  role: z.enum(["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"]).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});
