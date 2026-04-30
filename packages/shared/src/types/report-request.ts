/**
 * Report Request domain types
 * Parent requests report from teacher
 */

export interface ReportRequest {
  id: string;
  tenantId: string;
  parentId: string;
  studentId: string;
  teacherId: string;
  status: ReportRequestStatus;
  requestedAt: Date;
  completedAt?: Date;
  reportType: ReportRequestType;
  teacherRemarks?: string;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReportRequestStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
}

export enum ReportRequestType {
  PROGRESS = "PROGRESS",
  ATTENDANCE = "ATTENDANCE",
  BEHAVIOR = "BEHAVIOR",
  COMPREHENSIVE = "COMPREHENSIVE",
}
