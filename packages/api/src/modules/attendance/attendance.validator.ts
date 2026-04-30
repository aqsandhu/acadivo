/**
 * @file src/modules/attendance/attendance.validator.ts
 * @description Zod validators for attendance endpoints.
 */

import { z } from "zod";

export const markAttendanceValidator = z.object({
  classId: z.string().uuid(),
  sectionId: z.string().uuid(),
  date: z.string().datetime().optional(),
  studentId: z.string().uuid(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "LEAVE", "HALF_DAY", "EXCUSED"]),
  remarks: z.string().optional(),
  periodNumber: z.number().int().optional(),
  method: z.enum(["MANUAL", "BIOMETRIC", "QR", "APP"]).optional(),
});

export const markBulkAttendanceValidator = z.object({
  classId: z.string().uuid(),
  sectionId: z.string().uuid(),
  date: z.string().datetime().optional(),
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "LEAVE", "HALF_DAY", "EXCUSED"]),
      remarks: z.string().optional(),
      periodNumber: z.number().int().optional(),
    })
  ).min(1),
});

export const updateAttendanceValidator = z.object({
  status: z.enum(["PRESENT", "ABSENT", "LATE", "LEAVE", "HALF_DAY", "EXCUSED"]).optional(),
  remarks: z.string().optional(),
});
