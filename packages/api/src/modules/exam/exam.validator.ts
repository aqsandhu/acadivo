// ═══════════════════════════════════════════════
// Exam Validator — Zod validation schemas
// ═══════════════════════════════════════════════

import { z } from "zod";

export const createExamValidator = z.object({
  title: z.string().min(1, "Title is required").max(200),
  examType: z.enum(["QUIZ", "MIDTERM", "FINAL", "ASSIGNMENT", "PROJECT"]),
  academicYear: z.string().min(1, "Academic year is required"),
  term: z.enum(["FIRST", "SECOND", "THIRD", "FINAL"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateExamValidator = z.object({
  title: z.string().min(1).max(200).optional(),
  examType: z.enum(["QUIZ", "MIDTERM", "FINAL", "ASSIGNMENT", "PROJECT"]).optional(),
  academicYear: z.string().optional(),
  term: z.enum(["FIRST", "SECOND", "THIRD", "FINAL"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const examScheduleValidator = z.object({
  subjectId: z.string().uuid("Valid subject ID is required"),
  classId: z.string().uuid("Valid class ID is required"),
  sectionId: z.string().uuid("Valid section ID is required"),
  examDate: z.string().min(1, "Exam date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  maxMarks: z.number().int().min(1).default(100),
  passMarks: z.number().int().min(0).default(33),
  roomNumber: z.string().optional(),
  instructions: z.string().optional(),
});

export const updateExamScheduleValidator = z.object({
  subjectId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  sectionId: z.string().uuid().optional(),
  examDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  maxMarks: z.number().int().min(1).optional(),
  passMarks: z.number().int().min(0).optional(),
  roomNumber: z.string().optional(),
  instructions: z.string().optional(),
});

export const examResultValidator = z.object({
  studentId: z.string().uuid("Valid student ID is required"),
  marksObtained: z.number().int().min(0, "Marks cannot be negative"),
  remarks: z.string().optional(),
  status: z.enum(["PASS", "FAIL"]).optional(),
});

export const bulkExamResultsValidator = z.object({
  results: z.array(
    z.object({
      studentId: z.string().uuid("Valid student ID is required"),
      marksObtained: z.number().int().min(0, "Marks cannot be negative"),
      remarks: z.string().optional(),
      status: z.enum(["PASS", "FAIL"]).optional(),
    })
  ).min(1, "At least one result is required"),
});
