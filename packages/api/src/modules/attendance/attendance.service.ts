// ═══════════════════════════════════════════════
// Attendance Service — Business logic for attendance management
// ═══════════════════════════════════════════════

import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { summarizeAttendance } from "../../lib/academic";

// ── Types ──

export interface MarkAttendanceInput {
  classId: string;
  sectionId: string;
  date: string;
  studentId: string;
  status: string;
  remarks?: string;
  periodNumber?: number;
  method?: string;
}

export interface MarkBulkAttendanceInput {
  classId: string;
  sectionId: string;
  date: string;
  records: Array<{
    studentId: string;
    status: string;
    remarks?: string;
    periodNumber?: number;
  }>;
}

export interface UpdateAttendanceInput {
  status?: string;
  remarks?: string;
}

function getToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// ── Attendance CRUD ──

export async function getAttendance(tenantId: string, filters: {
  classId?: string;
  sectionId?: string;
  studentId?: string;
  date?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const { classId, sectionId, studentId, date, status, page = 1, pageSize = 50 } = filters;
  const where: Prisma.AttendanceWhereInput = { tenantId };

  if (classId) where.classId = classId;
  if (sectionId) where.sectionId = sectionId;
  if (studentId) where.studentId = studentId;
  if (date) where.date = new Date(date);
  if (status) where.status = status as any;

  const [records, totalCount] = await Promise.all([
    prisma.attendance.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        markedByTeacher: { select: { user: { select: { firstName: true, lastName: true } } } },
      },
    }),
    prisma.attendance.count({ where }),
  ]);

  return { records, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function markAttendance(tenantId: string, markedBy: string, data: MarkAttendanceInput) {
  const date = data.date ? new Date(data.date) : getToday();

  // Verify student belongs to class/section
  const student = await prisma.student.findFirst({
    where: { userId: data.studentId, classId: data.classId, sectionId: data.sectionId, tenantId },
  });
  if (!student) throw ApiError.notFound("Student not found in this class/section");

  const existing = await prisma.attendance.findUnique({
    where: {
      studentId_date_periodNumber: {
        studentId: data.studentId,
        date,
        periodNumber: data.periodNumber ?? 0,
      },
    },
  });

  let record;
  if (existing) {
    record = await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        status: data.status as any,
        remarks: data.remarks,
        markedBy,
        method: data.method as any || "MANUAL",
      },
    });
  } else {
    record = await prisma.attendance.create({
      data: {
        tenantId,
        studentId: data.studentId,
        classId: data.classId,
        sectionId: data.sectionId,
        date,
        status: data.status as any,
        remarks: data.remarks,
        markedBy,
        periodNumber: data.periodNumber ?? 0,
        method: data.method as any || "MANUAL",
      },
    });
  }

  // Check consecutive absences and alert
  await checkAndCreateAbsenceAlert(tenantId, data.studentId, data.classId, data.sectionId, date, markedBy);

  return record;
}

export async function markBulkAttendance(tenantId: string, markedBy: string, data: MarkBulkAttendanceInput) {
  const date = data.date ? new Date(data.date) : getToday();
  const created: any[] = [];
  const errors: Array<{ studentId: string; error: string }> = [];

  for (const record of data.records) {
    try {
      const student = await prisma.student.findFirst({
        where: { userId: record.studentId, classId: data.classId, sectionId: data.sectionId, tenantId },
      });
      if (!student) {
        errors.push({ studentId: record.studentId, error: "Student not found in this class/section" });
        continue;
      }

      const existing = await prisma.attendance.findUnique({
        where: {
          studentId_date_periodNumber: {
            studentId: record.studentId,
            date,
            periodNumber: record.periodNumber ?? 0,
          },
        },
      });

      let attendance;
      if (existing) {
        attendance = await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            status: record.status as any,
            remarks: record.remarks,
            markedBy,
          },
        });
      } else {
        attendance = await prisma.attendance.create({
          data: {
            tenantId,
            studentId: record.studentId,
            classId: data.classId,
            sectionId: data.sectionId,
            date,
            status: record.status as any,
            remarks: record.remarks,
            markedBy,
            periodNumber: record.periodNumber ?? 0,
          },
        });
      }

      created.push(attendance);

      // Check consecutive absences
      if (record.status === "ABSENT") {
        await checkAndCreateAbsenceAlert(tenantId, record.studentId, data.classId, data.sectionId, date, markedBy);
      }
    } catch (err: any) {
      errors.push({ studentId: record.studentId, error: err.message });
    }
  }

  return { created, errors, totalSubmitted: data.records.length };
}

export async function updateAttendance(id: string, tenantId: string, markedBy: string, data: UpdateAttendanceInput) {
  const attendance = await prisma.attendance.findFirst({ where: { id, tenantId } });
  if (!attendance) throw ApiError.notFound("Attendance record not found");

  const updateData: Prisma.AttendanceUpdateInput = {};
  if (data.status !== undefined) updateData.status = data.status as any;
  if (data.remarks !== undefined) updateData.remarks = data.remarks;

  return prisma.attendance.update({
    where: { id },
    data: updateData,
  });
}

// ── Student Attendance ──

export async function getStudentAttendance(studentId: string, tenantId: string, filters: {
  startDate?: string;
  endDate?: string;
}) {
  const student = await prisma.student.findFirst({ where: { userId: studentId, tenantId } });
  if (!student) throw ApiError.notFound("Student not found");

  const where: Prisma.AttendanceWhereInput = { studentId, tenantId };
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = new Date(filters.startDate);
    if (filters.endDate) where.date.lte = new Date(filters.endDate);
  }

  const records = await prisma.attendance.findMany({
    where,
    include: {
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
  });

  const summary = summarizeAttendance(records);

  return { student, records, summary };
}

// ── Summary ──

export async function getAttendanceSummary(tenantId: string, filters: {
  classId?: string;
  sectionId?: string;
  month?: string; // YYYY-MM
}) {
  const { classId, sectionId, month } = filters;

  let startDate: Date, endDate: Date;
  if (month) {
    const [year, m] = month.split("-").map(Number);
    startDate = new Date(year, m - 1, 1);
    endDate = new Date(year, m, 0, 23, 59, 59, 999);
  } else {
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  const where: Prisma.AttendanceWhereInput = { tenantId, date: { gte: startDate, lte: endDate } };
  if (classId) where.classId = classId;
  if (sectionId) where.sectionId = sectionId;

  const records = await prisma.attendance.findMany({
    where,
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
  });

  // Group by student
  const grouped = new Map<string, { student: any; records: typeof records }>();
  for (const r of records) {
    const key = r.studentId;
    if (!grouped.has(key)) {
      grouped.set(key, {
        student: {
          id: r.studentId,
          name: `${r.student.user.firstName} ${r.student.user.lastName}`,
          rollNumber: r.student.rollNumber,
        },
        records: [],
      });
    }
    grouped.get(key)!.records.push(r);
  }

  const summaries = Array.from(grouped.values()).map((entry) => ({
    ...entry,
    summary: summarizeAttendance(entry.records),
  }));

  // Class-level summary
  const classSummary = summarizeAttendance(records);

  return { summaries, classSummary, month: month || `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}` };
}

// ── Alerts ──

async function checkAndCreateAbsenceAlert(
  tenantId: string,
  studentId: string,
  classId: string,
  sectionId: string,
  currentDate: Date,
  senderId: string
) {
  // Check last 5 calendar days for 3+ consecutive absences
  const fiveDaysAgo = new Date(currentDate);
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const records = await prisma.attendance.findMany({
    where: {
      studentId,
      tenantId,
      classId,
      sectionId,
      date: { gte: fiveDaysAgo, lte: currentDate },
    },
    orderBy: { date: "desc" },
  });

  let consecutiveAbsent = 0;
  for (const r of records) {
    if (r.status === "ABSENT") consecutiveAbsent++;
    else break;
  }

  if (consecutiveAbsent >= 3) {
    // Check if unresolved alert already exists
    const existingAlert = await prisma.attendanceAlert.findFirst({
      where: { studentId, tenantId, isResolved: false },
    });

    if (!existingAlert) {
      await prisma.attendanceAlert.create({
        data: {
          tenantId,
          studentId,
          consecutiveDays: consecutiveAbsent,
          startDate: records[records.length - 1]?.date || currentDate,
          endDate: currentDate,
        },
      });
    }

    // Notify parents
    const parentLinks = await prisma.studentParent.findMany({
      where: { studentId },
      include: { parent: { include: { user: true } } },
    });

    for (const pl of parentLinks) {
      await prisma.notification.create({
        data: {
          tenantId,
          userId: pl.parent.userId,
          title: "Attendance Alert",
          body: `Your child has been absent for ${consecutiveAbsent} consecutive days.`,
          type: "ATTENDANCE_ALERT",
          priority: "HIGH",
          data: { studentId, consecutive: consecutiveAbsent },
          senderId,
        },
      });
    }
  }

  return consecutiveAbsent;
}

export async function getAlerts(tenantId: string, filters: { isResolved?: boolean; studentId?: string }) {
  const where: Prisma.AttendanceAlertWhereInput = { tenantId };
  if (filters.isResolved !== undefined) where.isResolved = filters.isResolved;
  if (filters.studentId) where.studentId = filters.studentId;

  return prisma.attendanceAlert.findMany({
    where,
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function resolveAlert(id: string, tenantId: string, resolvedBy: string) {
  const alert = await prisma.attendanceAlert.findFirst({ where: { id, tenantId } });
  if (!alert) throw ApiError.notFound("Alert not found");

  return prisma.attendanceAlert.update({
    where: { id },
    data: { isResolved: true, resolvedAt: new Date(), resolvedBy },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  });
}
