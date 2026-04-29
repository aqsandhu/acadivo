import { ResultTerm, ResultStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../lib/ApiError";



// ──────────────────────────────────────────────
// Result Service
// ──────────────────────────────────────────────

export async function getStudentResults(
  studentId: string,
  tenantId: string,
  filters: { academicYear?: string; term?: ResultTerm; page?: number; pageSize?: number }
) {
  const { academicYear, term, page = 1, pageSize = 20 } = filters;
  const where: Record<string, unknown> = { studentId, tenantId };
  if (academicYear) where.academicYear = academicYear;
  if (term) where.term = term;

  const [results, totalCount] = await Promise.all([
    prisma.result.findMany({
      where,
      orderBy: { generatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        student: {
          select: {
            userId: true,
            rollNumber: true,
            user: { select: { firstName: true, lastName: true, avatar: true } },
          },
        },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        resultDetails: {
          include: {
            subject: { select: { id: true, name: true, code: true } },
          },
        },
        generatedByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.result.count({ where }),
  ]);

  return { results, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function getResultById(id: string, tenantId: string) {
  const result = await prisma.result.findFirst({
    where: { id, tenantId },
    include: {
      student: {
        select: {
          userId: true,
          rollNumber: true,
          user: { select: { firstName: true, lastName: true, avatar: true } },
        },
      },
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      resultDetails: {
        include: {
          subject: { select: { id: true, name: true, code: true } },
        },
        orderBy: { subject: { name: "asc" } },
      },
      generatedByUser: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  if (!result) throw ApiError.notFound("Result not found");
  return result;
}

export async function compileResult(
  tenantId: string,
  generatedBy: string,
  data: {
    studentId: string;
    classId: string;
    sectionId: string;
    academicYear: string;
    term: ResultTerm;
    teacherRemarks?: string;
    principalRemarks?: string;
  }
) {
  // Fetch all marks for the student in this term/year
  const marks = await prisma.mark.findMany({
    where: {
      tenantId,
      studentId: data.studentId,
      academicYear: data.academicYear,
    },
    include: {
      subject: { select: { id: true, name: true } },
    },
  });

  if (marks.length === 0) {
    throw ApiError.unprocessable("No marks found for this student in the given academic year");
  }

  // Get school's default grading scheme
  const gradingScheme = await prisma.gradingScheme.findFirst({
    where: { tenantId, isDefault: true },
  });

  // Aggregate by subject
  const subjectMarks = new Map<string, { subjectId: string; totalMarks: number; obtainedMarks: number }>();
  for (const mark of marks) {
    const existing = subjectMarks.get(mark.subjectId);
    if (existing) {
      existing.totalMarks += mark.totalMarks;
      existing.obtainedMarks += mark.obtainedMarks;
    } else {
      subjectMarks.set(mark.subjectId, {
        subjectId: mark.subjectId,
        totalMarks: mark.totalMarks,
        obtainedMarks: mark.obtainedMarks,
      });
    }
  }

  let totalMarks = 0;
  let obtainedMarks = 0;
  const resultDetails: Array<{ subjectId: string; totalMarks: number; obtainedMarks: number; grade: string }> = [];

  for (const [, sm] of subjectMarks) {
    totalMarks += sm.totalMarks;
    obtainedMarks += sm.obtainedMarks;
    const percentage = (sm.obtainedMarks / sm.totalMarks) * 100;
    const grade = computeGrade(percentage, gradingScheme?.grades as any);
    resultDetails.push({
      subjectId: sm.subjectId,
      totalMarks: sm.totalMarks,
      obtainedMarks: sm.obtainedMarks,
      grade,
    });
  }

  const overallPercentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
  const overallGrade = computeGrade(overallPercentage, gradingScheme?.grades as any);
  const status: ResultStatus = overallPercentage >= 40 ? "PASS" : "FAIL";

  // Check for existing result
  const existing = await prisma.result.findUnique({
    where: {
      studentId_academicYear_term: {
        studentId: data.studentId,
        academicYear: data.academicYear,
        term: data.term,
      },
    },
  });

  if (existing) {
    throw ApiError.conflict("A result already exists for this student in the given term");
  }

  const result = await prisma.result.create({
    data: {
      tenantId,
      studentId: data.studentId,
      classId: data.classId,
      sectionId: data.sectionId,
      academicYear: data.academicYear,
      term: data.term,
      totalMarks,
      obtainedMarks,
      percentage: parseFloat(overallPercentage.toFixed(2)),
      grade: overallGrade,
      status,
      teacherRemarks: data.teacherRemarks,
      principalRemarks: data.principalRemarks,
      generatedBy,
    },
    include: {
      resultDetails: { include: { subject: { select: { name: true, code: true } } } },
      student: {
        select: {
          userId: true,
          rollNumber: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  // Create result details
  await prisma.resultDetail.createMany({
    data: resultDetails.map((rd) => ({
      tenantId,
      resultId: result.id,
      subjectId: rd.subjectId,
      totalMarks: rd.totalMarks,
      obtainedMarks: rd.obtainedMarks,
      grade: rd.grade,
    })),
  });

  return result;
}

export async function updateResult(
  id: string,
  tenantId: string,
  data: {
    teacherRemarks?: string;
    principalRemarks?: string;
    status?: ResultStatus;
  }
) {
  const result = await prisma.result.findFirst({ where: { id, tenantId } });
  if (!result) throw ApiError.notFound("Result not found");

  const updateData: Record<string, unknown> = {};
  if (data.teacherRemarks !== undefined) updateData.teacherRemarks = data.teacherRemarks;
  if (data.principalRemarks !== undefined) updateData.principalRemarks = data.principalRemarks;
  if (data.status !== undefined) updateData.status = data.status;

  return prisma.result.update({
    where: { id },
    data: updateData,
    include: {
      resultDetails: { include: { subject: { select: { name: true, code: true } } } },
      student: {
        select: {
          userId: true,
          rollNumber: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });
}

export async function deleteResult(id: string, tenantId: string) {
  const result = await prisma.result.findFirst({ where: { id, tenantId } });
  if (!result) throw ApiError.notFound("Result not found");

  await prisma.resultDetail.deleteMany({ where: { resultId: id } });
  await prisma.result.delete({ where: { id } });
  return { deleted: true };
}

export async function getClassResults(
  classId: string,
  tenantId: string,
  filters: { academicYear?: string; term?: ResultTerm; page?: number; pageSize?: number }
) {
  const { academicYear, term, page = 1, pageSize = 20 } = filters;
  const where: Record<string, unknown> = { classId, tenantId };
  if (academicYear) where.academicYear = academicYear;
  if (term) where.term = term;

  const [results, totalCount] = await Promise.all([
    prisma.result.findMany({
      where,
      orderBy: [{ rank: "asc" }, { percentage: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        student: {
          select: {
            userId: true,
            rollNumber: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        _count: { select: { resultDetails: true } },
      },
    }),
    prisma.result.count({ where }),
  ]);

  return { results, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function getClassRankings(
  classId: string,
  tenantId: string,
  filters: { academicYear?: string; term?: ResultTerm; page?: number; pageSize?: number }
) {
  const { academicYear, term, page = 1, pageSize = 20 } = filters;
  const where: Record<string, unknown> = { classId, tenantId };
  if (academicYear) where.academicYear = academicYear;
  if (term) where.term = term;

  const [results, totalCount] = await Promise.all([
    prisma.result.findMany({
      where,
      orderBy: { percentage: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        student: {
          select: {
            userId: true,
            rollNumber: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        resultDetails: {
          include: { subject: { select: { name: true } } },
        },
      },
    }),
    prisma.result.count({ where }),
  ]);

  // Assign ranks if not already assigned
  const ranked = results.map((r, i) => ({
    ...r,
    computedRank: i + 1,
  }));

  return { rankings: ranked, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

// ──────────────────────────────────────────────
// Grading Scheme Service
// ──────────────────────────────────────────────

export async function getGradingSchemes(tenantId: string) {
  return prisma.gradingScheme.findMany({
    where: { tenantId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function createGradingScheme(
  tenantId: string,
  data: {
    name: string;
    grades: Array<{ grade: string; minPercentage: number; maxPercentage: number; gpa?: number }>;
    academicYear: string;
    isDefault?: boolean;
  }
) {
  // If setting as default, unset existing default
  if (data.isDefault) {
    await prisma.gradingScheme.updateMany({
      where: { tenantId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.gradingScheme.create({
    data: {
      tenantId,
      name: data.name,
      grades: data.grades,
      academicYear: data.academicYear,
      isDefault: data.isDefault || false,
    },
  });
}

export async function setDefaultGradingScheme(id: string, tenantId: string) {
  const scheme = await prisma.gradingScheme.findFirst({ where: { id, tenantId } });
  if (!scheme) throw ApiError.notFound("Grading scheme not found");

  await prisma.gradingScheme.updateMany({
    where: { tenantId, isDefault: true },
    data: { isDefault: false },
  });

  return prisma.gradingScheme.update({
    where: { id },
    data: { isDefault: true },
  });
}

// ──────────────────────────────────────────────
// Marks Service (Admin/Principal view)
// ──────────────────────────────────────────────

export async function getStudentMarks(
  studentId: string,
  tenantId: string,
  filters: { academicYear?: string; examType?: string; page?: number; pageSize?: number }
) {
  const { academicYear, examType, page = 1, pageSize = 20 } = filters;
  const where: Record<string, unknown> = { studentId, tenantId };
  if (academicYear) where.academicYear = academicYear;
  if (examType) where.examType = examType;

  const [marks, totalCount] = await Promise.all([
    prisma.mark.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
      },
    }),
    prisma.mark.count({ where }),
  ]);

  return { marks, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function getClassMarks(
  classId: string,
  tenantId: string,
  filters: {
    sectionId?: string;
    subjectId?: string;
    examType?: string;
    academicYear?: string;
    page?: number;
    pageSize?: number;
  }
) {
  const { sectionId, subjectId, examType, academicYear, page = 1, pageSize = 20 } = filters;
  const where: Record<string, unknown> = { classId, tenantId };
  if (sectionId) where.sectionId = sectionId;
  if (subjectId) where.subjectId = subjectId;
  if (examType) where.examType = examType;
  if (academicYear) where.academicYear = academicYear;

  const [marks, totalCount] = await Promise.all([
    prisma.mark.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        student: {
          select: {
            userId: true,
            rollNumber: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
      },
    }),
    prisma.mark.count({ where }),
  ]);

  return { marks, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function getMarksAnalysis(
  tenantId: string,
  filters: { classId?: string; subjectId?: string; academicYear?: string; examType?: string }
) {
  const { classId, subjectId, academicYear, examType } = filters;
  const where: Record<string, unknown> = { tenantId };
  if (classId) where.classId = classId;
  if (subjectId) where.subjectId = subjectId;
  if (academicYear) where.academicYear = academicYear;
  if (examType) where.examType = examType;

  const marks = await prisma.mark.findMany({
    where,
    include: {
      subject: { select: { id: true, name: true } },
      student: {
        select: {
          userId: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  // Aggregate by subject
  const subjectMap = new Map<string, { subjectName: string; count: number; avgPercentage: number; highest: number; lowest: number; totalMarks: number; obtainedMarks: number }>();

  for (const mark of marks) {
    const key = mark.subjectId;
    const existing = subjectMap.get(key);
    if (existing) {
      existing.count++;
      existing.totalMarks += mark.totalMarks;
      existing.obtainedMarks += mark.obtainedMarks;
      existing.highest = Math.max(existing.highest, mark.percentage);
      existing.lowest = Math.min(existing.lowest, mark.percentage);
    } else {
      subjectMap.set(key, {
        subjectName: mark.subject.name,
        count: 1,
        totalMarks: mark.totalMarks,
        obtainedMarks: mark.obtainedMarks,
        highest: mark.percentage,
        lowest: mark.percentage,
        avgPercentage: 0,
      });
    }
  }

  const analysis = Array.from(subjectMap.entries()).map(([, data]) => ({
    subjectName: data.subjectName,
    count: data.count,
    avgPercentage: data.totalMarks > 0 ? parseFloat(((data.obtainedMarks / data.totalMarks) * 100).toFixed(2)) : 0,
    highest: data.highest,
    lowest: data.lowest,
  }));

  return { analysis, totalRecords: marks.length };
}

// ──────────────────────────────────────────────
// Helper: Compute grade from percentage
// ──────────────────────────────────────────────

function computeGrade(
  percentage: number,
  grades?: Array<{ grade: string; minPercentage: number; maxPercentage: number; gpa?: number }>
): string {
  if (!grades || grades.length === 0) {
    // Default grading fallback
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    if (percentage >= 40) return "E";
    return "F";
  }

  for (const g of grades) {
    if (percentage >= g.minPercentage && percentage <= g.maxPercentage) {
      return g.grade;
    }
  }

  return "F";
}
