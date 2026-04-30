/**
 * @file src/modules/mark/mark.validator.ts
 * @description Zod validators for mark endpoints.
 */

import { z } from "zod";

export const markCreateInput = z.object({
  studentId: z.string().uuid(),
  subjectId: z.string().uuid(),
  classId: z.string().uuid(),
  sectionId: z.string().uuid(),
  examId: z.string().uuid().optional(),
  gradingSchemeId: z.string().uuid().optional(),
  examType: z.enum(["QUIZ", "MIDTERM", "FINAL", "ASSIGNMENT", "PROJECT", "PRACTICAL", "ORAL"]),
  totalMarks: z.number().int().min(1),
  obtainedMarks: z.number().int().min(0),
  remarks: z.string().optional(),
  academicYear: z.string().optional(),
});

export const bulkMarkValidator = z.object({
  marks: z.array(markCreateInput).min(1),
});

export const updateMarkValidator = z.object({
  totalMarks: z.number().int().min(1).optional(),
  obtainedMarks: z.number().int().min(0).optional(),
  remarks: z.string().optional(),
  grade: z.string().optional(),
});

export const calculateResultValidator = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
  sectionId: z.string().uuid(),
  academicYear: z.string(),
  term: z.enum(["FIRST", "SECOND", "THIRD", "FINAL"]),
});
