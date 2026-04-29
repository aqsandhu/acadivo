// ─────────────────────────────────────────────
// Academic Utilities — Grades, Attendance helpers
// ─────────────────────────────────────────────

import { AttendanceStatus, NotificationType } from "@prisma/client";

export const DEFAULT_GRADES = [
  { grade: "A+", minPercentage: 90, maxPercentage: 100, gpa: 4.0 },
  { grade: "A", minPercentage: 80, maxPercentage: 89.99, gpa: 3.7 },
  { grade: "B", minPercentage: 70, maxPercentage: 79.99, gpa: 3.0 },
  { grade: "C", minPercentage: 60, maxPercentage: 69.99, gpa: 2.0 },
  { grade: "D", minPercentage: 50, maxPercentage: 59.99, gpa: 1.0 },
  { grade: "F", minPercentage: 0, maxPercentage: 49.99, gpa: 0.0 },
];

export function calculateGrade(percentage: number): string {
  for (const g of DEFAULT_GRADES) {
    if (percentage >= g.minPercentage && percentage <= g.maxPercentage) {
      return g.grade;
    }
  }
  return "F";
}

export function calculatePercentage(obtained: number, total: number): number {
  if (total === 0) return 0;
  return parseFloat(((obtained / total) * 100).toFixed(2));
}

export function calculateGPA(percentage: number): number {
  for (const g of DEFAULT_GRADES) {
    if (percentage >= g.minPercentage && percentage <= g.maxPercentage) {
      return g.gpa;
    }
  }
  return 0;
}

export function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function isLateSubmission(submittedAt: Date, dueDate: Date): boolean {
  return submittedAt > dueDate;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  leave: number;
  halfDay: number;
  total: number;
  percentage: number;
}

export function summarizeAttendance(
  records: { status: AttendanceStatus }[]
): AttendanceSummary {
  const summary: AttendanceSummary = {
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    halfDay: 0,
    total: records.length,
    percentage: 0,
  };

  for (const r of records) {
    switch (r.status) {
      case "PRESENT":
        summary.present++;
        break;
      case "ABSENT":
        summary.absent++;
        break;
      case "LATE":
        summary.late++;
        break;
      case "LEAVE":
        summary.leave++;
        break;
      case "HALF_DAY":
        summary.halfDay++;
        break;
    }
  }

  // Present + Late + Leave + HalfDay count as "attended"
  const attended = summary.present + summary.late + summary.leave + summary.halfDay;
  summary.percentage = summary.total > 0 ? parseFloat(((attended / summary.total) * 100).toFixed(2)) : 0;

  return summary;
}

export async function checkConsecutiveAbsences(
  prisma: any,
  studentId: string,
  tenantId: string,
  classId: string,
  sectionId: string,
  currentDate: Date
): Promise<number> {
  // Check last 3 school days
  const threeDaysAgo = new Date(currentDate);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 5); // look back 5 calendar days to cover weekends

  const records = await prisma.attendance.findMany({
    where: {
      studentId,
      tenantId,
      classId,
      sectionId,
      date: { gte: threeDaysAgo, lte: currentDate },
    },
    orderBy: { date: "desc" },
  });

  let consecutiveAbsent = 0;
  for (const r of records) {
    if (r.status === "ABSENT") consecutiveAbsent++;
    else break;
  }
  return consecutiveAbsent;
}
