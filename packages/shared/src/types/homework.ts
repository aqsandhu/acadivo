/**
 * Homework/Assignment domain types
 */

export interface Homework {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  sectionId: string;
  tenantId: string;
  teacherId: string;
  dueDate: Date;
  attachmentUrls?: string[];
  maxMarks?: number;
  isActive?: boolean;
  status: HomeworkStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum HomeworkStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
  ARCHIVED = "ARCHIVED",
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
  status: HomeworkSubmissionStatus;
}

export enum HomeworkSubmissionStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  LATE = "LATE",
  GRADED = "GRADED",
}
