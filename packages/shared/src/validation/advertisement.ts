/**
 * Advertisement validation schemas
 */

import { z } from "zod";

export const createAdSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(5).max(2000),
  imageUrl: z.string().url().optional(),
  linkUrl: z.string().url().optional(),
  placement: z.enum(["DASHBOARD", "LOGIN", "SIDEBAR", "BANNER", "POPUP"]),
  targetAudience: z.array(z.enum(["ADMIN", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"])).min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  priority: z.number().int().min(0).max(100).default(0),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

export const updateAdSchema = createAdSchema.partial();

export const adQuerySchema = z.object({
  placement: z.enum(["DASHBOARD", "LOGIN", "SIDEBAR", "BANNER", "POPUP"]).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "EXPIRED", "ARCHIVED"]).optional(),
  targetAudience: z.enum(["ADMIN", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT"]).optional(),
});
