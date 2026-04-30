// ═══════════════════════════════════════════════
// Exam Service — Business logic for exam management
// ═══════════════════════════════════════════════

import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

// ── Types ──

export interface ExamCreateInput {
  title: string;
  examType: string;
  academicYear: string;
  term: string;
  startDate: string;
  endDate: string;
  description?: string;
  isActive?: boolean;
}

export interface ExamUpdateInput {
  title?: string;
  examType?: string;
  academicYear?: string;
  term?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  isActive?: boolean;
}

export interface ExamScheduleInput {
  subjectId: string;
  classId: string;
  sectionId: string;
  examDate: string;
  startTime: string;
  endTime: string;
  maxMarks: number;
  passMarks: number;
  roomNumber?: string;
  instructions?: string;
}

export interface ExamResultInput {
  studentId: string;
  marksObtained: number;
  remarks?: string;
  status?: string;
}

// ═══════════════════════════════════════════════
// Exam CRUD
// ═══════════════════════════════════════════════

export async function getExams(tenantId: string, filters: {
  academicYear?: string;
  term?: string;
  examType?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const { academicYear, term, examType, isActive, page = 1, pageSize = 20 } = filters;
  const where: Record<string, unknown> = { tenantId };

  if (academicYear) where.academicYear = academicYear;
  if (term) where.term = term;
  if (examType) where.examType = examType;
  if (isActive !== undefined) where.isActive = isActive;

  const [exams, totalCount] = await Promise.all([
    prisma.exam.findMany({
      where,
      orderBy: { startDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { examSchedules: true, examResults: true } },
      },
    }),
    prisma.exam.count({ where }),
  ]);

  return { exams, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function getExamById(id: string, tenantId: string) {
  const exam = await prisma.exam.findFirst({
    where: { id, tenantId },
    include: {
      examSchedules: {
        include: {
          subject: { select: { id: true, name: true, code: true } },
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
        orderBy: { examDate: "asc" },
      },
      examResults: {
        include: {
          student: {
            select: {
              rollNumber: true,
              user: { select: { firstName: true, lastName: true } },
              class: { select: { name: true } },
              section: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      },
      _count: { select: { examSchedules: true, examResults: true } },
    },
  });

  if (!exam) throw ApiError.notFound("Exam not found");
  return exam;
}

export async function createExam(tenantId: string, data: ExamCreateInput) {
  return prisma.exam.create({
    data: {
      tenantId,
      title: data.title,
      examType: data.examType as any,
      academicYear: data.academicYear,
      term: data.term as any,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      description: data.description,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateExam(id: string, tenantId: string, data: ExamUpdateInput) {
  const exam = await prisma.exam.findFirst({ where: { id, tenantId } });
  if (!exam) throw ApiError.notFound("Exam not found");

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.examType !== undefined) updateData.examType = data.examType;
  if (data.academicYear !== undefined) updateData.academicYear = data.academicYear;
  if (data.term !== undefined) updateData.term = data.term;
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
  if (data.description !== undefined) updateData.description = data.description;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.exam.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteExam(id: string, tenantId: string) {
  const exam = await prisma.exam.findFirst({ where: { id, tenantId } });
  if (!exam) throw ApiError.notFound("Exam not found");

  await prisma.examResult.deleteMany({ where: { examId: id } });
  await prisma.examSchedule.deleteMany({ where: { examId: id } });
  await prisma.exam.delete({ where: { id } });

  return { id, deleted: true };
}

// ═══════════════════════════════════════════════
// Exam Schedule
// ═══════════════════════════════════════════════

export async function getExamSchedule(examId: string, tenantId: string) {
  const exam = await prisma.exam.findFirst({
    where: { id: examId, tenantId },
    include: {
      examSchedules: {
        include: {
          subject: { select: { id: true, name: true, code: true } },
          class: { select: { id: true, name: true, grade: true } },
          section: { select: { id: true, name: true } },
        },
        orderBy: { examDate: "asc" },
      },
    },
  });

  if (!exam) throw ApiError.notFound("Exam not found");
  return exam.examSchedules;
}

export async function addExamSchedule(examId: string, tenantId: string, data: ExamScheduleInput) {
  const exam = await prisma.exam.findFirst({ where: { id: examId, tenantId } });
  if (!exam) throw ApiError.notFound("Exam not found");

  // Check for schedule conflicts on same date/time for the same class/section
  const conflict = await prisma.examSchedule.findFirst({
    where: {
      examId,
      classId: data.classId,
      sectionId: data.sectionId,
      examDate: new Date(data.examDate),
      OR: [
        { startTime: { lte: data.startTime }, endTime: { gte: data.startTime } },
        { startTime: { lte: data.endTime }, endTime: { gte: data.endTime } },
      ],
    },
  });

  if (conflict) {
    throw ApiError.conflict("An exam is already scheduled for this class/section at the specified time");
  }

  return prisma.examSchedule.create({
    data: {
      tenantId,
      examId,
      subjectId: data.subjectId,
      classId: data.classId,
      sectionId: data.sectionId,
      examDate: new Date(data.examDate),
      startTime: data.startTime,
      endTime: data.endTime,
      maxMarks: data.maxMarks,
      passMarks: data.passMarks,
      roomNumber: data.roomNumber,
      instructions: data.instructions,
    },
    include: {
      subject: { select: { id: true, name: true, code: true } },
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
    },
  });
}

export async function updateExamSchedule(scheduleId: string, tenantId: string, data: Partial<ExamScheduleInput>) {
  const schedule = await prisma.examSchedule.findFirst({ where: { id: scheduleId, tenantId } });
  if (!schedule) throw ApiError.notFound("Exam schedule not found");

  const updateData: Record<string, unknown> = {};
  if (data.subjectId !== undefined) updateData.subjectId = data.subjectId;
  if (data.classId !== undefined) updateData.classId = data.classId;
  if (data.sectionId !== undefined) updateData.sectionId = data.sectionId;
  if (data.examDate !== undefined) updateData.examDate = new Date(data.examDate);
  if (data.startTime !== undefined) updateData.startTime = data.startTime;
  if (data.endTime !== undefined) updateData.endTime = data.endTime;
  if (data.maxMarks !== undefined) updateData.maxMarks = data.maxMarks;
  if (data.passMarks !== undefined) updateData.passMarks = data.passMarks;
  if (data.roomNumber !== undefined) updateData.roomNumber = data.roomNumber;
  if (data.instructions !== undefined) updateData.instructions = data.instructions;

  return prisma.examSchedule.update({
    where: { id: scheduleId },
    data: updateData,
    include: {
      subject: { select: { id: true, name: true, code: true } },
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
    },
  });
}

export async function deleteExamSchedule(scheduleId: string, tenantId: string) {
  const schedule = await prisma.examSchedule.findFirst({ where: { id: scheduleId, tenantId } });
  if (!schedule) throw ApiError.notFound("Exam schedule not found");

  await prisma.examSchedule.delete({ where: { id: scheduleId } });
  return { id: scheduleId, deleted: true };
}

// ═══════════════════════════════════════════════
// Exam Results
// ═══════════════════════════════════════════════

export async function getExamResults(examId: string, tenantId: string, filters: {
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  page?: number;
  pageSize?: number;
}) {
  const { classId, sectionId, subjectId, page = 1, pageSize = 50 } = filters;

  const exam = await prisma.exam.findFirst({ where: { id: examId, tenantId } });
  if (!exam) throw ApiError.notFound("Exam not found");

  const where: Record<string, unknown> = { examId, tenantId };
  if (classId) where.classId = classId;
  if (sectionId) where.sectionId = sectionId;
  if (subjectId) where.subjectId = subjectId;

  const [results, totalCount] = await Promise.all([
    prisma.examResult.findMany({
      where,
      orderBy: [
        { classId: "asc" },
        { sectionId: "asc" },
        { marksObtained: "desc" },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        student: {
          select: {
            rollNumber: true,
            user: { select: { firstName: true, lastName: true } },
            class: { select: { name: true } },
            section: { select: { name: true } },
          },
        },
        subject: { select: { id: true, name: true, code: true } },
      },
    }),
    prisma.examResult.count({ where }),
  ]);

  return { results, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function addExamResult(examId: string, tenantId: string, scheduleId: string, data: ExamResultInput) {
  const schedule = await prisma.examSchedule.findFirst({
    where: { id: scheduleId, examId, tenantId },
  });
  if (!schedule) throw ApiError.notFound("Exam schedule not found");

  const percentage = (data.marksObtained / schedule.maxMarks) * 100;
  const status = data.marksObtained >= schedule.passMarks ? "PASS" : "FAIL";

  // Check if result already exists
  const existing = await prisma.examResult.findFirst({
    where: {
      examId,
      studentId: data.studentId,
      subjectId: schedule.subjectId,
    },
  });

  if (existing) {
    return prisma.examResult.update({
      where: { id: existing.id },
      data: {
        marksObtained: data.marksObtained,
        percentage,
        status: status as any,
        remarks: data.remarks,
        scheduleId,
      },
      include: {
        student: {
          select: {
            rollNumber: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        subject: { select: { id: true, name: true, code: true } },
      },
    });
  }

  return prisma.examResult.create({
    data: {
      tenantId,
      examId,
      scheduleId,
      studentId: data.studentId,
      subjectId: schedule.subjectId,
      classId: schedule.classId,
      sectionId: schedule.sectionId,
      marksObtained: data.marksObtained,
      maxMarks: schedule.maxMarks,
      percentage,
      status: status as any,
      remarks: data.remarks,
    },
    include: {
      student: {
        select: {
          rollNumber: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      subject: { select: { id: true, name: true, code: true } },
    },
  });
}

export async function addBulkExamResults(examId: string, tenantId: string, scheduleId: string, results: ExamResultInput[]) {
  const schedule = await prisma.examSchedule.findFirst({
    where: { id: scheduleId, examId, tenantId },
  });
  if (!schedule) throw ApiError.notFound("Exam schedule not found");

  const createdResults = [];
  const errors: Array<{ studentId: string; error: string }> = [];

  for (const data of results) {
    try {
      const percentage = (data.marksObtained / schedule.maxMarks) * 100;
      const status = data.marksObtained >= schedule.passMarks ? "PASS" : "FAIL";

      const existing = await prisma.examResult.findFirst({
        where: {
          examId,
          studentId: data.studentId,
          subjectId: schedule.subjectId,
        },
      });

      let result;
      if (existing) {
        result = await prisma.examResult.update({
          where: { id: existing.id },
          data: {
            marksObtained: data.marksObtained,
            percentage,
            status: status as any,
            remarks: data.remarks,
            scheduleId,
          },
        });
      } else {
        result = await prisma.examResult.create({
          data: {
            tenantId,
            examId,
            scheduleId,
            studentId: data.studentId,
            subjectId: schedule.subjectId,
            classId: schedule.classId,
            sectionId: schedule.sectionId,
            marksObtained: data.marksObtained,
            maxMarks: schedule.maxMarks,
            percentage,
            status: status as any,
            remarks: data.remarks,
          },
        });
      }
      createdResults.push(result);
    } catch (err: any) {
      errors.push({ studentId: data.studentId, error: err.message });
    }
  }

  return { createdResults, errors, totalSubmitted: results.length };
}

export async function deleteExamResult(resultId: string, tenantId: string) {
  const result = await prisma.examResult.findFirst({ where: { id: resultId, tenantId } });
  if (!result) throw ApiError.notFound("Exam result not found");

  await prisma.examResult.delete({ where: { id: resultId } });
  return { id: resultId, deleted: true };
}

// ═══════════════════════════════════════════════
// Student Exam View
// ═══════════════════════════════════════════════

export async function getStudentExams(studentId: string, tenantId: string) {
  const student = await prisma.student.findUnique({
    where: { userId: studentId },
    include: { class: true, section: true },
  });
  if (!student || student.tenantId !== tenantId) throw ApiError.notFound("Student not found");

  const exams = await prisma.exam.findMany({
    where: {
      tenantId,
      isActive: true,
      examSchedules: {
        some: {
          classId: student.classId,
          sectionId: student.sectionId,
        },
      },
    },
    include: {
      examSchedules: {
        where: {
          classId: student.classId,
          sectionId: student.sectionId,
        },
        include: {
          subject: { select: { id: true, name: true, code: true } },
        },
        orderBy: { examDate: "asc" },
      },
      examResults: {
        where: { studentId },
        include: {
          subject: { select: { id: true, name: true, code: true } },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return exams.map((exam) => ({
    ...exam,
    studentResults: exam.examResults,
  }));
}

export async function getStudentExamResults(studentId: string, tenantId: string, examId?: string) {
  const student = await prisma.student.findUnique({ where: { userId: studentId } });
  if (!student || student.tenantId !== tenantId) throw ApiError.notFound("Student not found");

  const where: Record<string, unknown> = { studentId, tenantId };
  if (examId) where.examId = examId;

  return prisma.examResult.findMany({
    where,
    include: {
      exam: { select: { id: true, title: true, examType: true, term: true } },
      subject: { select: { id: true, name: true, code: true } },
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ═══════════════════════════════════════════════
// Exam Statistics
// ═══════════════════════════════════════════════

export async function getExamStatistics(examId: string, tenantId: string) {
  const exam = await prisma.exam.findFirst({ where: { id: examId, tenantId } });
  if (!exam) throw ApiError.notFound("Exam not found");

  const results = await prisma.examResult.findMany({
    where: { examId, tenantId },
    include: {
      subject: { select: { id: true, name: true } },
      student: {
        select: {
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      },
    },
  });

  const totalStudents = new Set(results.map((r) => r.studentId)).size;
  const passCount = results.filter((r) => r.status === "PASS").length;
  const failCount = results.filter((r) => r.status === "FAIL").length;

  const subjectStats: Record<string, { subjectName: string; total: number; pass: number; fail: number; avgPercentage: number }> = {};

  for (const r of results) {
    const key = r.subjectId;
    if (!subjectStats[key]) {
      subjectStats[key] = { subjectName: r.subject.name, total: 0, pass: 0, fail: 0, avgPercentage: 0 };
    }
    subjectStats[key].total++;
    if (r.status === "PASS") subjectStats[key].pass++;
    else subjectStats[key].fail++;
    subjectStats[key].avgPercentage += r.percentage;
  }

  for (const key of Object.keys(subjectStats)) {
    const stat = subjectStats[key];
    stat.avgPercentage = stat.total > 0 ? Math.round((stat.avgPercentage / stat.total) * 100) / 100 : 0;
  }

  const overallAvgPercentage = results.length > 0
    ? Math.round((results.reduce((sum, r) => sum + r.percentage, 0) / results.length) * 100) / 100
    : 0;

  return {
    examId,
    examTitle: exam.title,
    totalStudents,
    totalResults: results.length,
    passCount,
    failCount,
    passRate: totalStudents > 0 ? Math.round((passCount / results.length) * 10000) / 100 : 0,
    overallAvgPercentage,
    subjectStats: Object.values(subjectStats),
  };
}
