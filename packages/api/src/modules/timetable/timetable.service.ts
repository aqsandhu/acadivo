// ═══════════════════════════════════════════════
// Timetable Service — Business logic for timetable / class schedule
// ═══════════════════════════════════════════════

import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

// ── Types ──

export interface ScheduleCreateInput {
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  academicYear?: string;
}

export interface ScheduleUpdateInput {
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  teacherId?: string;
  dayOfWeek?: number;
  periodNumber?: number;
  startTime?: string;
  endTime?: string;
  roomNumber?: string;
  academicYear?: string;
  isActive?: boolean;
}

// ── Helpers ──

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function periodsOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

// ── Timetable CRUD ──

export async function getTimetable(tenantId: string, filters: {
  classId?: string;
  sectionId?: string;
  teacherId?: string;
  dayOfWeek?: number;
  academicYear?: string;
}) {
  const { classId, sectionId, teacherId, dayOfWeek, academicYear } = filters;
  const where: Record<string, unknown> = { tenantId, isActive: true };

  if (classId) where.classId = classId;
  if (sectionId) where.sectionId = sectionId;
  if (teacherId) where.teacherId = teacherId;
  if (dayOfWeek !== undefined) where.dayOfWeek = dayOfWeek;
  if (academicYear) where.academicYear = academicYear;

  const schedules = await prisma.classSchedule.findMany({
    where,
    include: {
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } },
      teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: [{ dayOfWeek: "asc" as const }, { periodNumber: "asc" as const }],
  });

  // Group by day
  const grouped: Record<number, typeof schedules> = {};
  for (const s of schedules) {
    if (!grouped[s.dayOfWeek]) grouped[s.dayOfWeek] = [];
    grouped[s.dayOfWeek].push(s);
  }

  return { schedules, grouped };
}

export async function createSchedule(tenantId: string, data: ScheduleCreateInput) {
  const academicYear = data.academicYear || new Date().getFullYear().toString();

  // Check unique constraint: class + section + day + period + academicYear
  const existing = await prisma.classSchedule.findUnique({
    where: {
      classId_sectionId_dayOfWeek_periodNumber_academicYear: {
        classId: data.classId,
        sectionId: data.sectionId,
        dayOfWeek: data.dayOfWeek,
        periodNumber: data.periodNumber,
        academicYear,
      },
    },
  });

  if (existing) {
    throw ApiError.conflict("A schedule already exists for this class/section at the given day and period");
  }

  // Check teacher conflict: same teacher, same day, overlapping time
  const teacherConflict = await prisma.classSchedule.findFirst({
    where: {
      tenantId,
      teacherId: data.teacherId,
      dayOfWeek: data.dayOfWeek,
      isActive: true,
      OR: [
        { startTime: { lte: data.endTime }, endTime: { gte: data.startTime } },
      ],
    },
  });

  if (teacherConflict) {
    throw ApiError.conflict("Teacher already has a class at this time slot");
  }

  return prisma.classSchedule.create({
    data: {
      tenantId,
      classId: data.classId,
      sectionId: data.sectionId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      dayOfWeek: data.dayOfWeek,
      periodNumber: data.periodNumber,
      startTime: data.startTime,
      endTime: data.endTime,
      roomNumber: data.roomNumber,
      academicYear,
    },
    include: {
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } },
      teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
    },
  });
}

export async function updateSchedule(id: string, tenantId: string, data: ScheduleUpdateInput) {
  const schedule = await prisma.classSchedule.findFirst({ where: { id, tenantId } });
  if (!schedule) throw ApiError.notFound("Schedule not found");

  const updateData: Record<string, unknown> = {};
  if (data.classId !== undefined) updateData.classId = data.classId;
  if (data.sectionId !== undefined) updateData.sectionId = data.sectionId;
  if (data.subjectId !== undefined) updateData.subjectId = data.subjectId;
  if (data.teacherId !== undefined) updateData.teacherId = data.teacherId;
  if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek;
  if (data.periodNumber !== undefined) updateData.periodNumber = data.periodNumber;
  if (data.startTime !== undefined) updateData.startTime = data.startTime;
  if (data.endTime !== undefined) updateData.endTime = data.endTime;
  if (data.roomNumber !== undefined) updateData.roomNumber = data.roomNumber;
  if (data.academicYear !== undefined) updateData.academicYear = data.academicYear;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.classSchedule.update({
    where: { id },
    data: updateData,
    include: {
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } },
      teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
    },
  });
}

export async function deleteSchedule(id: string, tenantId: string) {
  const schedule = await prisma.classSchedule.findFirst({ where: { id, tenantId } });
  if (!schedule) throw ApiError.notFound("Schedule not found");

  await prisma.classSchedule.delete({ where: { id } });
  return { id, deleted: true };
}

// ── Bulk ──

export async function createBulkSchedules(tenantId: string, schedules: ScheduleCreateInput[]) {
  const created: any[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  for (let i = 0; i < schedules.length; i++) {
    try {
      const schedule = await createSchedule(tenantId, schedules[i]);
      created.push(schedule);
    } catch (err: any) {
      errors.push({ index: i, error: err.message });
    }
  }

  return { created, errors, totalSubmitted: schedules.length };
}

// ── Teacher Timetable ──

export async function getTeacherTimetable(teacherId: string, tenantId: string) {
  const schedules = await prisma.classSchedule.findMany({
    where: { teacherId, tenantId, isActive: true },
    include: {
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } },
    },
    orderBy: [{ dayOfWeek: "asc" as const }, { periodNumber: "asc" as const }],
  });

  const grouped: Record<number, typeof schedules> = {};
  for (const s of schedules) {
    if (!grouped[s.dayOfWeek]) grouped[s.dayOfWeek] = [];
    grouped[s.dayOfWeek].push(s);
  }

  return { schedules, grouped };
}

// ── Conflicts ──

export async function detectConflicts(tenantId: string, filters: {
  classId?: string;
  sectionId?: string;
  teacherId?: string;
  dayOfWeek?: number;
}) {
  const { classId, sectionId, teacherId, dayOfWeek } = filters;
  const where: Record<string, unknown> = { tenantId, isActive: true };

  if (classId) where.classId = classId;
  if (sectionId) where.sectionId = sectionId;
  if (teacherId) where.teacherId = teacherId;
  if (dayOfWeek !== undefined) where.dayOfWeek = dayOfWeek;

  const schedules = await prisma.classSchedule.findMany({
    where,
    include: {
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true } },
      teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: [{ dayOfWeek: "asc" as const }, { startTime: "asc" as const }],
  });

  const conflicts: Array<{
    type: "TEACHER" | "ROOM" | "CLASS";
    schedule1: any;
    schedule2: any;
    reason: string;
  }> = [];

  // Compare all pairs for conflicts
  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const a = schedules[i];
      const b = schedules[j];

      // Must be same day to conflict
      if (a.dayOfWeek !== b.dayOfWeek) continue;

      // Check time overlap
      if (!periodsOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) continue;

      // Teacher conflict
      if (a.teacherId === b.teacherId) {
        conflicts.push({
          type: "TEACHER",
          schedule1: a,
          schedule2: b,
          reason: `Teacher ${a.teacher.user.firstName} ${a.teacher.user.lastName} has overlapping classes`,
        });
      }

      // Room conflict
      if (a.roomNumber && a.roomNumber === b.roomNumber) {
        conflicts.push({
          type: "ROOM",
          schedule1: a,
          schedule2: b,
          reason: `Room ${a.roomNumber} double-booked`,
        });
      }

      // Class + Section conflict at same period
      if (a.classId === b.classId && a.sectionId === b.sectionId && a.periodNumber === b.periodNumber) {
        conflicts.push({
          type: "CLASS",
          schedule1: a,
          schedule2: b,
          reason: `Class ${a.class.name} - Section ${a.section.name} has double booking at period ${a.periodNumber}`,
        });
      }
    }
  }

  return { schedules, conflicts, conflictCount: conflicts.length };
}
