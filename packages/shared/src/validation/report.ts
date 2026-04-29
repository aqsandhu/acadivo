/**
 * Report validation schemas
 */

import { z } from "zod";

export const generateReportSchema = z.object({
  name: z.string().min(2).max(200),
  type: z.enum(["ATTENDANCE", "FEE", "RESULT", "STUDENT", "TEACHER", "ANALYTICS", "CUSTOM"]),
  format: z.enum(["PDF", "CSV", "EXCEL", "JSON"]).default("PDF"),
  parameters: z.record(z.unknown()),
});

export const reportQuerySchema = z.object({
  type: z.enum(["ATTENDANCE", "FEE", "RESULT", "STUDENT", "TEACHER", "ANALYTICS", "CUSTOM"]).optional(),
  status: z.enum(["PENDING", "GENERATING", "READY", "FAILED", "EXPIRED"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
