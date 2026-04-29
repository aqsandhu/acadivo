/**
 * @file src/validators/common.ts
 * @description Common Zod validation schemas for reuse across modules.
 */

import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const searchSchema = z.object({
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const tenantIdSchema = z.object({
  tenantId: z.string().uuid().optional(),
});
