/**
 * Timetable validation schemas
 */

import { z } from "zod";

export const createTimetableSchema = z.object({
  classId: z.string().uuid(),
  academicYear: z.string().min(4).max(20),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
  entries: z.array(z.object({
    subjectId: z.string().uuid(),
    teacherId: z.string().uuid(),
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    roomNumber: z.string().max(50).optional(),
  })).min(1),
});

export const updateTimetableSchema = createTimetableSchema.partial();

export const timetableEntrySchema = z.object({
  timetableId: z.string().uuid(),
  subjectId: z.string().uuid(),
  teacherId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  roomNumber: z.string().max(50).optional(),
});
