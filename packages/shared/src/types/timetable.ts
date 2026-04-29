/**
 * Timetable / Schedule domain types
 */

export interface Timetable {
  id: string;
  tenantId: string;
  classId: string;
  academicYear: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  status: TimetableStatus;
  entries: TimetableEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TimetableStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

export interface TimetableEntry {
  id: string;
  timetableId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number; // 0 = Monday
  startTime: string; // HH:mm
  endTime: string;
  roomNumber?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  label: string;
}
