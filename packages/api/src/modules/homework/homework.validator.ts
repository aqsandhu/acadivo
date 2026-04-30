/**
 * @file src/modules/homework/homework.validator.ts
 * @description Zod validators for homework endpoints.
 */

import { z } from "zod";

export const createHomeworkValidator = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(1),
  subjectId: z.string().uuid(),
  classId: z.string().uuid(),
  sectionId: z.string().uuid(),
  dueDate: z.string().datetime(),
  attachments: z.array(z.any()).optional(),
  maxMarks: z.number().int().min(1).optional(),
});

export const updateHomeworkValidator = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  attachments: z.array(z.any()).optional(),
  maxMarks: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  status: z.enum(["PENDING", "ACTIVE", "CLOSED", "ARCHIVED"]).optional(),
});

export const submitHomeworkValidator = z.object({
  submissionText: z.string().optional(),
  attachments: z.array(z.any()).optional(),
});

export const gradeSubmissionValidator = z.object({
  submissionId: z.string().uuid(),
  marks: z.number().int().min(0),
  feedback: z.string().optional(),
});
