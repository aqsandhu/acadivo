/**
 * Attendance validation schemas
 */

import { z } from "zod";

export const markAttendanceSchema = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
  date: z.coerce.date(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED", "HALF_DAY"]),
  subjectId: z.string().uuid().optional(),
  remarks: z.string().max(500).optional(),
  method: z.enum(["MANUAL", "BIOMETRIC", "QR", "APP"]).default("MANUAL"),
});

export const bulkAttendanceSchema = z.object({
  classId: z.string().uuid(),
  date: z.coerce.date(),
  records: z.array(z.object({
    studentId: z.string().uuid(),
    status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED", "HALF_DAY"]),
    remarks: z.string().max(500).optional(),
  })).min(1),
});

export const attendanceQuerySchema = z.object({
  classId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED", "HALF_DAY"]).optional(),
});
