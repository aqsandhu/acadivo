/**
 * Attendance Alert domain types
 * 3-consecutive-absence auto-alert
 */

export interface AttendanceAlert {
  id: string;
  tenantId: string;
  studentId: string;
  consecutiveDays: number;
  startDate: Date;
  endDate?: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
