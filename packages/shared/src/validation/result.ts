/**
 * Result validation schemas
 */

import { z } from "zod";

export const createExamSchema = z.object({
  name: z.string().min(2).max(200),
  type: z.enum(["QUIZ", "MIDTERM", "FINAL", "ASSIGNMENT", "PROJECT", "PRACTICAL", "ORAL"]),
  classId: z.string().uuid(),
  subjectId: z.string().uuid().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
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

// Mark validation schemas
export const createMarkSchema = z.object({
  studentId: z.string().uuid(),
  subjectId: z.string().uuid(),
  classId: z.string().uuid(),
  sectionId: z.string().uuid(),
  teacherId: z.string().uuid(),
  examId: z.string().uuid().optional(),
  gradingSchemeId: z.string().uuid().optional(),
  examType: z.enum(["QUIZ", "MIDTERM", "FINAL", "ASSIGNMENT", "PROJECT", "PRACTICAL", "ORAL"]),
  totalMarks: z.number().positive(),
  obtainedMarks: z.number().min(0),
  percentage: z.number().min(0).max(100),
  grade: z.string().min(1).max(10),
  remarks: z.string().max(1000).optional(),
  academicYear: z.string().min(4).max(10),
});

export const updateMarkSchema = createMarkSchema.partial().omit({ studentId: true, subjectId: true });

export const markQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  subjectId: z.string().uuid().optional(),
  examId: z.string().uuid().optional(),
  academicYear: z.string().optional(),
});

// Report Request validation schemas
export const createReportRequestSchema = z.object({
  parentId: z.string().uuid(),
  studentId: z.string().uuid(),
  teacherId: z.string().uuid(),
  reportType: z.enum(["PROGRESS", "ATTENDANCE", "BEHAVIOR", "COMPREHENSIVE"]),
  teacherRemarks: z.string().max(2000).optional(),
});

export const updateReportRequestSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "REJECTED"]).optional(),
  teacherRemarks: z.string().max(2000).optional(),
  pdfUrl: z.string().url().optional(),
});

export const reportRequestQuerySchema = z.object({
  parentId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  status: z.enum(["PENDING", "COMPLETED", "REJECTED"]).optional(),
});
