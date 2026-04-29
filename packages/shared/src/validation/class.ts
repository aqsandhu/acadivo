/**
 * Class validation schemas
 */

import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(1).max(100),
  section: z.string().max(50).optional(),
  grade: z.string().min(1).max(50),
  classTeacherId: z.string().uuid().optional(),
  roomNumber: z.string().max(50).optional(),
  capacity: z.number().int().min(1).max(200).default(40),
  academicYear: z.string().max(20),
});

export const updateClassSchema = createClassSchema.partial();

export const scheduleEntrySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),
  room: z.string().max(50).optional(),
});

export const assignSubjectSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  teacherId: z.string().uuid(),
  schedule: z.array(scheduleEntrySchema).optional(),
});
