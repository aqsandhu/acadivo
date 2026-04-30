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
  endDate?: Date;
  maxMarks: number;
  passingMarks: number;
  weightage?: number;
  status: ExamStatus;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ExamType {
  QUIZ = "QUIZ",
  MIDTERM = "MIDTERM",
  FINAL = "FINAL",
  ASSIGNMENT = "ASSIGNMENT",
  PROJECT = "PROJECT",
  PRACTICAL = "PRACTICAL",
  ORAL = "ORAL",
}

export enum ExamStatus {
  SCHEDULED = "SCHEDULED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Backward compatibility: ExamResult maps to legacy usage
export interface ExamResult {
  id: string;
  examId?: string;
  studentId: string;
  classId: string;
  tenantId: string;
  academicYear: string;
  marksObtained: number;
  grade?: string;
  percentage?: number;
  remarks?: string;
  status: ResultStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Prisma Result model aligned type
export interface Result {
  id: string;
  tenantId: string;
  studentId: string;
  classId: string;
  sectionId: string;
  academicYear: string;
  term: ResultTerm;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  rank?: number;
  status: ResultStatus;
  teacherRemarks?: string;
  principalRemarks?: string;
  isPublished: boolean;
  publishedAt?: Date;
  generatedAt: Date;
  generatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ResultStatus {
  PASS = "PASS",
  FAIL = "FAIL",
  PROMOTED = "PROMOTED",
  ABSENT = "ABSENT",
  INCOMPLETE = "INCOMPLETE",
}

export enum ResultTerm {
  FIRST = "FIRST",
  SECOND = "SECOND",
  THIRD = "THIRD",
  FINAL = "FINAL",
}

export interface GradeScale {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  gpa?: number;
  gradePoint?: number;
  remark?: string;
}
