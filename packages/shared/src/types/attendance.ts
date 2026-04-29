/**
 * Attendance domain types
 */

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  tenantId: string;
  date: Date;
  status: AttendanceStatus;
  subjectId?: string;
  markedById: string;
  remarks?: string;
  checkIn?: Date;
  checkOut?: Date;
  method: AttendanceMethod;
  createdAt: Date;
  updatedAt: Date;
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED",
  HALF_DAY = "HALF_DAY",
}

export enum AttendanceMethod {
  MANUAL = "MANUAL",
  BIOMETRIC = "BIOMETRIC",
  QR = "QR",
  APP = "APP",
}

export interface AttendanceSummary {
  studentId: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  halfDay: number;
  percentage: number;
  period: string;
}
