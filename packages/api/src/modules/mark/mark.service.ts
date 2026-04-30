// ═══════════════════════════════════════════════
// Mark / Gradebook Service — Business logic for marks and results
// ═══════════════════════════════════════════════

import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { calculateGrade, calculatePercentage } from "../../lib/academic";

// ── Types ──

export interface MarkCreateInput {
  studentId: string;
  subjectId: string;
  classId: string;
  sectionId: string;
  examId?: string;
  gradingSchemeId?: string;
  examType: string;
  totalMarks: number;
  obtainedMarks: number;
  remarks?: string;
  academicYear?: string;
}

export interface MarkUpdateInput {
  totalMarks?: number;
  obtainedMarks?: number;
  remarks?: string;
  grade?: string;
}

export interface CalculateResultInput {
  studentId: string;
  classId: string;
  sectionId: string;
  academicYear: string;
  term: string;
}

// ── Marks CRUD ──

export async function getMarks(tenantId: string, filters: {
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  studentId?: string;
  examType?: string;
  academicYear?: string;
  page?: number;
  pageSize?: number;
}) {
  const { classId, sectionId, subjectId, studentId, examType, academicYear, page = 1, pageSize = 50 } = filters;
  const where: Prisma.MarkWhereInput = { tenantId };

  if (classId) where.classId = classId;
  if (sectionId) where.sectionId = sectionId;
  if (subjectId) where.subjectId = subjectId;
  if (studentId) where.studentId = studentId;
  if (examType) where.examType = examType as any;
  if (academicYear) where.academicYear = academicYear;

  const [marks, totalCount] = await Promise.all([
    prisma.mark.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        subject: { select: { id: true, name: true, code: true } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
        exam: { select: { id: true, name: true } },
        gradingScheme: { select: { id: true, name: true } },
      },
    }),
    prisma.mark.count({ where }),
  ]);

  return { marks, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function createBulkMarks(tenantId: string, teacherId: string, marks: MarkCreateInput[]) {
  const created: any[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  const academicYear = marks[0]?.academicYear || new Date().getFullYear().toString();

  for (let i = 0; i < marks.length; i++) {
    try {
      const data = marks[i];
      const percentage = calculatePercentage(data.obtainedMarks, data.totalMarks);
      const grade = calculateGrade(percentage);

      // Check for existing mark
      const existing = await prisma.mark.findFirst({
        where: {
          studentId: data.studentId,
          subjectId: data.subjectId,
          examType: data.examType as any,
          academicYear: data.academicYear || academicYear,
          tenantId,
        },
      });

      let mark;
      if (existing) {
        mark = await prisma.mark.update({
          where: { id: existing.id },
          data: {
            totalMarks: data.totalMarks,
            obtainedMarks: data.obtainedMarks,
            percentage,
            grade,
            remarks: data.remarks,
            teacherId,
          },
        });
      } else {
        mark = await prisma.mark.create({
          data: {
            tenantId,
            studentId: data.studentId,
            subjectId: data.subjectId,
            classId: data.classId,
            sectionId: data.sectionId,
            teacherId,
            examId: data.examId || null,
            gradingSchemeId: data.gradingSchemeId || null,
            examType: data.examType as any,
            totalMarks: data.totalMarks,
            obtainedMarks: data.obtainedMarks,
            percentage,
            grade,
            remarks: data.remarks,
            academicYear: data.academicYear || academicYear,
          },
        });
      }

      created.push(mark);
    } catch (err: any) {
      errors.push({ index: i, error: err.message });
    }
  }

  return { created, errors, totalSubmitted: marks.length };
}

export async function updateMark(id: string, tenantId: string, data: MarkUpdateInput) {
  const mark = await prisma.mark.findFirst({ where: { id, tenantId } });
  if (!mark) throw ApiError.notFound("Mark not found");

  const updateData: Prisma.MarkUpdateInput = {};
  if (data.totalMarks !== undefined) updateData.totalMarks = data.totalMarks;
  if (data.obtainedMarks !== undefined) updateData.obtainedMarks = data.obtainedMarks;
  if (data.remarks !== undefined) updateData.remarks = data.remarks;

  if (data.totalMarks !== undefined || data.obtainedMarks !== undefined) {
    const total = data.totalMarks ?? mark.totalMarks;
    const obtained = data.obtainedMarks ?? mark.obtainedMarks;
    updateData.percentage = calculatePercentage(obtained, total);
    updateData.grade = calculateGrade(updateData.percentage as number);
  }

  if (data.grade !== undefined) updateData.grade = data.grade;

  return prisma.mark.update({
    where: { id },
    data: updateData,
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      subject: { select: { id: true, name: true } },
    },
  });
}

// ── Student Marks ──

export async function getStudentMarks(studentId: string, tenantId: string, filters: {
  academicYear?: string;
  examType?: string;
}) {
  const student = await prisma.student.findFirst({ where: { userId: studentId, tenantId } });
  if (!student) throw ApiError.notFound("Student not found");

  const where: Prisma.MarkWhereInput = { studentId, tenantId };
  if (filters.academicYear) where.academicYear = filters.academicYear;
  if (filters.examType) where.examType = filters.examType as any;

  const marks = await prisma.mark.findMany({
    where,
    include: {
      subject: { select: { id: true, name: true, code: true } },
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
      exam: { select: { id: true, name: true } },
    },
    orderBy: [{ subject: { name: "asc" } }, { createdAt: "desc" }],
  });

  // Group by subject
  const bySubject = new Map<string, { subject: any; marks: typeof marks; average: number }>();
  for (const m of marks) {
    const key = m.subjectId;
    if (!bySubject.has(key)) {
      bySubject.set(key, { subject: m.subject, marks: [], average: 0 });
    }
    bySubject.get(key)!.marks.push(m);
  }

  for (const entry of bySubject.values()) {
    entry.average = entry.marks.length > 0
      ? parseFloat((entry.marks.reduce((s, m) => s + m.percentage, 0) / entry.marks.length).toFixed(2))
      : 0;
  }

  return { student, marks, bySubject: Array.from(bySubject.values()) };
}

// ── Calculate Compiled Result ──

export async function calculateCompiledResult(tenantId: string, generatedBy: string, data: CalculateResultInput) {
  const { studentId, classId, sectionId, academicYear, term } = data;

  const student = await prisma.student.findFirst({
    where: { userId: studentId, tenantId, classId, sectionId },
  });
  if (!student) throw ApiError.notFound("Student not found in this class/section");

  // Get default grading scheme
  const gradingScheme = await prisma.gradingScheme.findFirst({
    where: { tenantId, isDefault: true, academicYear },
  });

  // Get all marks for the student in the academic year
  const marks = await prisma.mark.findMany({
    where: { studentId, tenantId, academicYear },
    include: { subject: { select: { id: true, name: true, code: true } } },
  });

  if (marks.length === 0) throw ApiError.badRequest("No marks found for this student in the given academic year");

  // Use latest mark per subject
  const latestBySubject = new Map<string, typeof marks[0]>();
  for (const m of marks) {
    const existing = latestBySubject.get(m.subjectId);
    if (!existing || new Date(m.createdAt) > new Date(existing.createdAt)) {
      latestBySubject.set(m.subjectId, m);
    }
  }

  const subjectMarks = Array.from(latestBySubject.values());
  const totalMarks = subjectMarks.reduce((sum, m) => sum + m.totalMarks, 0);
  const obtainedMarks = subjectMarks.reduce((sum, m) => sum + m.obtainedMarks, 0);
  const percentage = calculatePercentage(obtainedMarks, totalMarks);
  const grade = calculateGrade(percentage);

  // Determine status
  let status: any = percentage >= 50 ? "PASS" : "FAIL";

  // Create result
  const result = await prisma.result.create({
    data: {
      tenantId,
      studentId,
      classId,
      sectionId,
      academicYear,
      term: term as any,
      totalMarks,
      obtainedMarks,
      percentage,
      grade,
      status,
      generatedBy,
    },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
    },
  });

  // Create result details per subject
  const resultDetails = [];
  for (const m of subjectMarks) {
    const detail = await prisma.resultDetail.create({
      data: {
        tenantId,
        resultId: result.id,
        subjectId: m.subjectId,
        totalMarks: m.totalMarks,
        obtainedMarks: m.obtainedMarks,
        grade: m.grade,
        remarks: m.remarks,
      },
      include: { subject: { select: { name: true, code: true } } },
    });
    resultDetails.push(detail);
  }

  // Calculate rank in class
  const allResults = await prisma.result.findMany({
    where: { classId, sectionId, academicYear, term: term as any, tenantId },
    orderBy: { percentage: "desc" },
  });

  const rank = allResults.findIndex((r) => r.id === result.id) + 1;
  if (rank > 0) {
    await prisma.result.update({
      where: { id: result.id },
      data: { rank },
    });
  }

  return { result: { ...result, rank }, resultDetails, subjectCount: subjectMarks.length };
}
