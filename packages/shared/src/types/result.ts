/**
 * Exam Result / Grade domain types
 */

export interface Exam {
  id: string;
  tenantId: string;
  name: string;
  type: ExamType;
  classId: string;
  subjectId?: string;
  startDate: Date;
  endDate: Date;
  maxMarks: number;
  passingMarks: number;
  weightage?: number;
  status: ExamStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ExamType {
  QUIZ = "QUIZ",
  MIDTERM = "MIDTERM",
  FINAL = "FINAL",
  ASSIGNMENT = "ASSIGNMENT",
  PRACTICAL = "PRACTICAL",
  ORAL = "ORAL",
}

export enum ExamStatus {
  SCHEDULED = "SCHEDULED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  classId: string;
  tenantId: string;
  marksObtained: number;
  grade?: string;
  percentage?: number;
  remarks?: string;
  status: ResultStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ResultStatus {
  PASS = "PASS",
  FAIL = "FAIL",
  ABSENT = "ABSENT",
  INCOMPLETE = "INCOMPLETE",
}

export interface GradeScale {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  gpa?: number;
  remark?: string;
}
