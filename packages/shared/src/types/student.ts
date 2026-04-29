/**
 * Student domain types
 */

export interface Student {
  id: string;
  userId: string;
  tenantId: string;
  rollNumber: string;
  admissionDate: Date;
  admissionNumber: string;
  classId: string;
  section?: string;
  guardianId?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum StudentStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  GRADUATED = "GRADUATED",
  TRANSFERRED = "TRANSFERRED",
  SUSPENDED = "SUSPENDED",
}

export interface StudentGuardian {
  id: string;
  studentId: string;
  guardianId: string;
  relation: string;
  isPrimary: boolean;
}
