// ═══════════════════════════════════════════════
// Homework Service — Business logic for homework management
// ═══════════════════════════════════════════════

import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { isLateSubmission } from "../../lib/academic";

// ── Types ──

export interface HomeworkCreateInput {
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  sectionId: string;
  dueDate: string;
  attachments?: any[];
  maxMarks?: number;
}

export interface HomeworkUpdateInput {
  title?: string;
  description?: string;
  dueDate?: string;
  attachments?: any[];
  maxMarks?: number;
  isActive?: boolean;
  status?: string;
}

export interface HomeworkSubmitInput {
  submissionText?: string;
  attachments?: any[];
}

export interface GradeSubmissionInput {
  submissionId: string;
  marks: number;
  feedback?: string;
}

// ── Homework CRUD ──

export async function getHomeworks(tenantId: string, filters: {
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  teacherId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const { classId, sectionId, subjectId, teacherId, status, page = 1, pageSize = 20 } = filters;
  const where: Prisma.HomeworkWhereInput = { tenantId };

  if (classId) where.classId = classId;
  if (sectionId) where.sectionId = sectionId;
  if (subjectId) where.subjectId = subjectId;
  if (teacherId) where.teacherId = teacherId;
  if (status) where.status = status as any;

  const [homeworks, totalCount] = await Promise.all([
    prisma.homework.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } },
        _count: { select: { submissions: true } },
      },
    }),
    prisma.homework.count({ where }),
  ]);

  // Auto-calculate status for each homework
  const enriched = homeworks.map((hw) => ({
    ...hw,
    computedStatus: hw.status === "ACTIVE" && new Date(hw.dueDate) < new Date() ? "OVERDUE" : hw.status,
  }));

  return { homeworks: enriched, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function getHomeworkById(id: string, tenantId: string) {
  const homework = await prisma.homework.findFirst({
    where: { id, tenantId },
    include: {
      teacher: { select: { user: { select: { firstName: true, lastName: true } } } },
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, code: true } },
      submissions: {
        include: {
          student: {
            include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
          },
          gradedByTeacher: { select: { firstName: true, lastName: true } },
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  if (!homework) throw ApiError.notFound("Homework not found");

  return {
    ...homework,
    computedStatus: homework.status === "ACTIVE" && new Date(homework.dueDate) < new Date() ? "OVERDUE" : homework.status,
  };
}

export async function createHomework(tenantId: string, teacherId: string, data: HomeworkCreateInput) {
  const homework = await prisma.homework.create({
    data: {
      tenantId,
      teacherId,
      classId: data.classId,
      sectionId: data.sectionId,
      subjectId: data.subjectId,
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      maxMarks: data.maxMarks,
      attachments: data.attachments as any,
      status: "ACTIVE",
    },
    include: {
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true } },
    },
  });

  // Notify students in class
  const students = await prisma.student.findMany({
    where: { classId: data.classId, sectionId: data.sectionId, tenantId, status: "ACTIVE" },
    select: { userId: true },
  });

  for (const s of students) {
    await prisma.notification.create({
      data: {
        tenantId,
        userId: s.userId,
        title: "New Homework",
        body: `${data.title} assigned. Due: ${new Date(data.dueDate).toLocaleDateString()}`,
        type: "HOMEWORK",
        data: { homeworkId: homework.id },
        senderId: teacherId,
      },
    });
  }

  return homework;
}

export async function updateHomework(id: string, tenantId: string, teacherId: string, data: HomeworkUpdateInput) {
  const homework = await prisma.homework.findFirst({ where: { id, tenantId, teacherId } });
  if (!homework) throw ApiError.notFound("Homework not found or unauthorized");

  const updateData: Prisma.HomeworkUpdateInput = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
  if (data.attachments !== undefined) updateData.attachments = data.attachments as any;
  if (data.maxMarks !== undefined) updateData.maxMarks = data.maxMarks;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.status !== undefined) updateData.status = data.status as any;

  return prisma.homework.update({
    where: { id },
    data: updateData,
    include: {
      class: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true } },
    },
  });
}

export async function deleteHomework(id: string, tenantId: string, teacherId: string) {
  const homework = await prisma.homework.findFirst({ where: { id, tenantId, teacherId } });
  if (!homework) throw ApiError.notFound("Homework not found or unauthorized");

  await prisma.homeworkSubmission.deleteMany({ where: { homeworkId: id } });
  await prisma.homework.delete({ where: { id } });
  return { id, deleted: true };
}

// ── Submissions ──

export async function getHomeworkSubmissions(homeworkId: string, tenantId: string) {
  const homework = await prisma.homework.findFirst({ where: { id: homeworkId, tenantId } });
  if (!homework) throw ApiError.notFound("Homework not found");

  return prisma.homeworkSubmission.findMany({
    where: { homeworkId, tenantId },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
      gradedByTeacher: { select: { firstName: true, lastName: true } },
    },
    orderBy: { submittedAt: "desc" },
  });
}

export async function submitHomework(homeworkId: string, tenantId: string, studentId: string, data: HomeworkSubmitInput) {
  const homework = await prisma.homework.findFirst({ where: { id: homeworkId, tenantId } });
  if (!homework) throw ApiError.notFound("Homework not found");

  const existing = await prisma.homeworkSubmission.findUnique({
    where: { homeworkId_studentId: { homeworkId, studentId } },
  });

  const isLate = homework.dueDate ? isLateSubmission(new Date(), homework.dueDate) : false;
  const submissionData = {
    submissionText: data.submissionText,
    attachments: data.attachments as any,
    submittedAt: new Date(),
    status: isLate ? "LATE" : "SUBMITTED",
  };

  if (existing) {
    return prisma.homeworkSubmission.update({
      where: { id: existing.id },
      data: submissionData,
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        homework: { select: { title: true } },
      },
    });
  }

  return prisma.homeworkSubmission.create({
    data: {
      tenantId,
      homeworkId,
      studentId,
      ...submissionData,
    },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      homework: { select: { title: true } },
    },
  });
}

export async function gradeSubmission(homeworkId: string, tenantId: string, teacherId: string, data: GradeSubmissionInput) {
  const homework = await prisma.homework.findFirst({ where: { id: homeworkId, tenantId, teacherId } });
  if (!homework) throw ApiError.notFound("Homework not found or unauthorized");

  const submission = await prisma.homeworkSubmission.findFirst({
    where: { id: data.submissionId, homeworkId, tenantId },
  });
  if (!submission) throw ApiError.notFound("Submission not found");

  const updated = await prisma.homeworkSubmission.update({
    where: { id: data.submissionId },
    data: {
      marks: data.marks,
      feedback: data.feedback,
      gradedBy: teacherId,
      gradedAt: new Date(),
      status: "GRADED",
    },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  });

  // Notify student
  await prisma.notification.create({
    data: {
      tenantId,
      userId: submission.studentId,
      title: "Homework Graded",
      body: `Your submission for "${homework.title}" has been graded.`,
      type: "HOMEWORK",
      data: { homeworkId, submissionId: data.submissionId, marks: data.marks },
      senderId: teacherId,
    },
  });

  return updated;
}
