/**
 * Teacher domain types
 */

export interface Teacher {
  id: string;
  userId: string;
  tenantId: string;
  employeeId: string;
  qualification: string;
  specialization?: string;
  joiningDate: Date;
  salary?: number;
  subjects: string[];
  classes: string[];
  status: TeacherStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum TeacherStatus {
  ACTIVE = "ACTIVE",
  ON_LEAVE = "ON_LEAVE",
  RESIGNED = "RESIGNED",
  SUSPENDED = "SUSPENDED",
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  academicYear: string;
}
