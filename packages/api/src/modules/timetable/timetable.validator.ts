/**
 * @file src/modules/timetable/timetable.validator.ts
 * @description Zod validators for timetable endpoints.
 */

import { z } from "zod";

export const createScheduleValidator = z.object({
  classId: z.string().uuid(),
  sectionId: z.string().uuid(),
  subjectId: z.string().uuid(),
  teacherId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  periodNumber: z.number().int().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  roomNumber: z.string().optional(),
  academicYear: z.string().optional(),
});

export const updateScheduleValidator = z.object({
  classId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  periodNumber: z.number().int().min(1).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  roomNumber: z.string().optional(),
  academicYear: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const bulkScheduleValidator = z.object({
  schedules: z.array(createScheduleValidator).min(1),
});
