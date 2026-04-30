/**
 * Fee validation schemas
 */

import { z } from "zod";

export const createFeeStructureSchema = z.object({
  name: z.string().min(2).max(200),
  classId: z.string().uuid().optional(),
  amount: z.number().positive().max(10000000),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "SEMESTERLY", "YEARLY", "ONE_TIME"]),
  dueDay: z.number().int().min(1).max(31),
  lateFee: z.number().min(0).optional(),
  description: z.string().max(1000).optional(),
});

export const updateFeeStructureSchema = createFeeStructureSchema.partial();

export const recordPaymentSchema = z.object({
  studentId: z.string().uuid(),
  feeStructureId: z.string().uuid(),
  amount: z.number().positive(),
  discount: z.number().min(0).default(0),
  fine: z.number().min(0).default(0),
  method: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "CARD", "ONLINE"]),
  transactionId: z.string().max(200).optional(),
  remarks: z.string().max(1000).optional(),
});

export const feeQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  status: z.enum(["PAID", "PENDING", "PARTIAL", "OVERDUE", "WAIVED"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
