/**
 * Homework/Assignment domain types
 */

export interface Homework {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  tenantId: string;
  teacherId: string;
  dueDate: Date;
  attachmentUrls?: string[];
  maxMarks?: number;
  status: HomeworkStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum HomeworkStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  GRADED = "GRADED",
  LATE = "LATE",
  OVERDUE = "OVERDUE",
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  submissionDate: Date;
  content?: string;
  attachments?: string[];
  marks?: number;
  feedback?: string;
  status: SubmissionStatus;
}

export enum SubmissionStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  GRADED = "GRADED",
  LATE = "LATE",
}
