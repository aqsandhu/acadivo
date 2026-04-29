/**
 * Result validation schemas
 */

import { z } from "zod";

export const createExamSchema = z.object({
  name: z.string().min(2).max(200),
  type: z.enum(["QUIZ", "MIDTERM", "FINAL", "ASSIGNMENT", "PRACTICAL", "ORAL"]),
  classId: z.string().uuid(),
  subjectId: z.string().uuid().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  maxMarks: z.number().positive().max(10000),
  passingMarks: z.number().positive(),
  weightage: z.number().min(0).max(100).optional(),
});

export const updateExamSchema = createExamSchema.partial();

export const recordResultSchema = z.object({
  examId: z.string().uuid(),
  studentId: z.string().uuid(),
  marksObtained: z.number().min(0),
  remarks: z.string().max(1000).optional(),
});

export const bulkResultSchema = z.object({
  examId: z.string().uuid(),
  results: z.array(z.object({
    studentId: z.string().uuid(),
    marksObtained: z.number().min(0),
    remarks: z.string().max(1000).optional(),
  })).min(1),
});

export const gradeScaleSchema = z.array(z.object({
  grade: z.string().min(1).max(10),
  minPercentage: z.number().min(0).max(100),
  maxPercentage: z.number().min(0).max(100),
  gpa: z.number().optional(),
  remark: z.string().max(100).optional(),
}));
