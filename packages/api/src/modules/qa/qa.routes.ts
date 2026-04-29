/**
 * @file src/modules/qa/qa.routes.ts
 * @description Dedicated Q&A routes with teacher approval for class-wide visibility.
 */

import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validateBody } from "../../middleware/validateRequest";
import { z } from "zod";
import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { successResponse } from "../../utils/ApiResponse";

const router = Router();

// All Q&A routes require authentication
router.use(authenticate);

const askSchema = z.object({
  teacherId: z.string().uuid(),
  subjectId: z.string().uuid(),
  question: z.string().min(1).max(2000),
});

const answerSchema = z.object({
  answer: z.string().min(1).max(2000),
  isPublic: z.boolean().default(false),
});

const approveSchema = z.object({
  approved: z.boolean(),
});

// ── Student / Parent: Ask Question ──
router.post("/ask", validateBody(askSchema), async (req, res) => {
  const userId = req.user!.userId;
  const tenantId = req.user!.tenantId!;
  const { teacherId, subjectId, question } = req.body;

  // Verify teacher-subject assignment
  const assignment = await prisma.teacherSubject.findFirst({
    where: { teacherId, subjectId, tenantId },
  });

  if (!assignment) {
    throw ApiError.badRequest("Teacher does not teach this subject", "INVALID_TEACHER_SUBJECT");
  }

  const qaEntry = await prisma.message.create({
    data: {
      tenantId,
      senderId: userId,
      receiverId: teacherId,
      content: question,
      messageType: "TEXT",
    },
  });

  // Notify teacher
  await prisma.notification.create({
    data: {
      tenantId,
      userId: teacherId,
      title: "New Question",
      body: question.substring(0, 100),
      type: "MESSAGE",
      data: { messageId: qaEntry.id, senderId: userId },
      senderId: userId,
    },
  });

  res.status(201).json(successResponse(qaEntry, "Question submitted successfully"));
});

// ── Teacher: Answer Question ──
router.post("/:id/answer", validateBody(answerSchema), async (req, res) => {
  const userId = req.user!.userId;
  const tenantId = req.user!.tenantId!;
  const questionId = req.params.id;
  const { answer, isPublic } = req.body;

  const question = await prisma.message.findFirst({
    where: { id: questionId, tenantId, receiverId: userId },
  });

  if (!question) {
    throw ApiError.notFound("Question not found", "QUESTION_NOT_FOUND");
  }

  const reply = await prisma.message.create({
    data: {
      tenantId,
      senderId: userId,
      receiverId: question.senderId,
      content: answer,
      messageType: "TEXT",
      replyToId: questionId,
    },
  });

  // Notify student
  await prisma.notification.create({
    data: {
      tenantId,
      userId: question.senderId,
      title: "Your question was answered",
      body: answer.substring(0, 100),
      type: "MESSAGE",
      data: { messageId: reply.id, questionId, isPublic },
      senderId: userId,
    },
  });

  // If marked public, notify all students in the same class
  if (isPublic) {
    const student = await prisma.student.findUnique({
      where: { userId: question.senderId },
      select: { classId: true, sectionId: true },
    });

    if (student) {
      const classmates = await prisma.student.findMany({
        where: {
          classId: student.classId,
          sectionId: student.sectionId,
          tenantId,
          userId: { not: question.senderId },
        },
        select: { userId: true },
      });

      await prisma.notification.createMany({
        data: classmates.map((c) => ({
          tenantId,
          userId: c.userId,
          title: "New public Q&A",
          body: answer.substring(0, 100),
          type: "MESSAGE",
          data: { messageId: reply.id, questionId, isPublic: true },
          senderId: userId,
        })),
      });
    }
  }

  res.status(201).json(successResponse(reply, "Answer submitted successfully"));
});

// ── Get My Q&A Threads ──
router.get("/my", async (req, res) => {
  const userId = req.user!.userId;
  const tenantId = req.user!.tenantId!;

  const messages = await prisma.message.findMany({
    where: {
      tenantId,
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: { firstName: true, lastName: true, role: true } },
      receiver: { select: { firstName: true, lastName: true, role: true } },
      replies: {
        include: { sender: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "asc" },
      },
      replyTo: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  res.status(200).json(successResponse(messages, "Q&A threads fetched"));
});

// ── Get Public Q&A for a Class ──
router.get("/public", async (req, res) => {
  const userId = req.user!.userId;
  const tenantId = req.user!.tenantId!;
  const classId = req.query.classId as string | undefined;
  const sectionId = req.query.sectionId as string | undefined;

  // Get student to resolve class if not provided
  let targetClassId = classId;
  let targetSectionId = sectionId;

  if (!targetClassId) {
    const student = await prisma.student.findUnique({
      where: { userId },
      select: { classId: true, sectionId: true },
    });
    if (student) {
      targetClassId = student.classId;
      targetSectionId = student.sectionId;
    }
  }

  if (!targetClassId) {
    throw ApiError.badRequest("classId or sectionId required", "MISSING_CLASS");
  }

  // Find teachers for this class/section
  const teacherSubjects = await prisma.teacherSubject.findMany({
    where: { classId: targetClassId, sectionId: targetSectionId, tenantId },
    select: { teacherId: true },
    distinct: ["teacherId"],
  });

  const teacherIds = teacherSubjects.map((ts) => ts.teacherId);

  const publicQA = await prisma.message.findMany({
    where: {
      tenantId,
      receiverId: { in: teacherIds },
    },
    include: {
      sender: { select: { firstName: true, lastName: true } },
      replies: {
        include: { sender: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  res.status(200).json(successResponse(publicQA, "Public Q&A fetched"));
});

export default router;
