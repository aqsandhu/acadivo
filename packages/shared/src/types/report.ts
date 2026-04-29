/**
 * Report / Analytics domain types
 */

export interface Report {
  id: string;
  tenantId: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  generatedById: string;
  parameters: Record<string, unknown>;
  downloadUrl?: string;
  status: ReportStatus;
  createdAt: Date;
  expiresAt?: Date;
}

export enum ReportType {
  ATTENDANCE = "ATTENDANCE",
  FEE = "FEE",
  RESULT = "RESULT",
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  ANALYTICS = "ANALYTICS",
  CUSTOM = "CUSTOM",
}

export enum ReportFormat {
  PDF = "PDF",
  CSV = "CSV",
  EXCEL = "EXCEL",
  JSON = "JSON",
}

export enum ReportStatus {
  PENDING = "PENDING",
  GENERATING = "GENERATING",
  READY = "READY",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
}

export interface DashboardMetrics {
  tenantId: string;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceToday: number;
  feeCollectionThisMonth: number;
  feeDueThisMonth: number;
  pendingHomework: number;
  upcomingExams: number;
  date: Date;
}
