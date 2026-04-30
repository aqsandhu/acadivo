/**
 * Mark domain types
 * Subject-wise marks/assessments
 */

import type { ExamType } from "./result";

export { ExamType } from "./result";

export interface Mark {
  id: string;
  tenantId: string;
  studentId: string;
  subjectId: string;
  classId: string;
  sectionId: string;
  teacherId: string;
  examId?: string;
  gradingSchemeId?: string;
  examType: ExamType;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  remarks?: string;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}
