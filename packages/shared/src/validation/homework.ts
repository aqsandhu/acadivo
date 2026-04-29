/**
 * Homework validation schemas
 */

import { z } from "zod";

export const createHomeworkSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(5).max(5000),
  subjectId: z.string().uuid(),
  classId: z.string().uuid(),
  dueDate: z.coerce.date(),
  attachmentUrls: z.array(z.string().url()).max(10).optional(),
  maxMarks: z.number().int().min(1).max(1000).optional(),
});

export const updateHomeworkSchema = createHomeworkSchema.partial();

export const submitHomeworkSchema = z.object({
  homeworkId: z.string().uuid(),
  content: z.string().max(10000).optional(),
  attachments: z.array(z.string().url()).max(10).optional(),
});

export const gradeHomeworkSchema = z.object({
  submissionId: z.string().uuid(),
  marks: z.number().min(0),
  feedback: z.string().max(2000).optional(),
  status: z.enum(["GRADED", "LATE", "PENDING"]),
});
