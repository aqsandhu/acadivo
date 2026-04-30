/**
 * Student domain types
 */

export interface Student {
  id: string;
  userId: string;
  tenantId: string;
  rollNumber: string;
  admissionNumber?: string;
  admissionDate: Date;
  classId: string;
  sectionId: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  guardianCNIC?: string;
  bloodGroup?: string;
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
