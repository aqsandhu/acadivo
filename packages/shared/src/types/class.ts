/**
 * Class domain types
 */

export interface Class {
  id: string;
  name: string;
  section?: string;
  grade: string;
  tenantId: string;
  classTeacherId?: string;
  roomNumber?: string;
  capacity: number;
  academicYear: string;
  status: ClassStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ClassStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
}

export interface ClassSubject {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  schedule: ScheduleEntry[];
}

export interface ScheduleEntry {
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  room?: string;
}
