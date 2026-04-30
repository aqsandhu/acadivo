// ─────────────────────────────────────────────
// Parent Service — Business logic for parent academic workflows
// ─────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { summarizeAttendance, getStartOfMonth, getEndOfMonth } from "../../lib/academic";

// ═══════════════════════════════════════════════
// Dashboard & Children
// ═══════════════════════════════════════════════

export async function getParentDashboard(userId: string, tenantId: string) {
  const parent = await prisma.parent.findUnique({
    where: { userId },
    include: {
      children: {
        include: {
          student: {
            include: {
              class: true,
              section: true,
              user: { select: { firstName: true, lastName: true, avatar: true } },
            },
          },
        },
      },
      user: { select: { firstName: true, lastName: true } },
    },
  });

  if (!parent) throw ApiError.notFound("Parent profile not found");

  const childIds = parent.children.map((c) => c.studentId);

  // Pending fee
  const pendingFee = await prisma.feeRecord.findMany({
    where: { studentId: { in: childIds }, tenantId, status: { in: ["UNPAID", "PARTIAL"] } },
    include: { feeStructure: true },
  });

  // Unread messages
  const unreadMessages = await prisma.message.count({
    where: { receiverId: userId, tenantId, isRead: false },
  });

  // Unread notifications
  const unreadNotifications = await prisma.notification.count({
    where: { userId, tenantId, isRead: false },
  });

  // School announcements
  const announcements = await prisma.announcement.findMany({
    where: {
      tenantId,
      OR: [
        { targetAudience: "ALL" },
        { targetAudience: "PARENTS" },
      ],
      expiresAt: { gte: new Date() },
    },
    include: { postedByUser: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    parent: {
      id: userId,
      name: `${parent.user.firstName} ${parent.user.lastName}`,
    },
    children: parent.children.map((c) => ({
      id: c.studentId,
      name: `${c.student.user.firstName} ${c.student.user.lastName}`,
      avatar: c.student.user.avatar,
      rollNumber: c.student.rollNumber,
      class: c.student.class.name,
      section: c.student.section.name,
      status: c.student.status,
      relation: c.relation,
      isPrimary: c.isPrimary,
    })),
    pendingFee: {
      totalDue: pendingFee.reduce((sum, f) => sum + Number(f.balance), 0),
      count: pendingFee.length,
      records: pendingFee.map((f) => ({
        id: f.id,
        amount: f.amount,
        balance: f.balance,
        dueDate: f.dueDate,
        status: f.status,
        feeType: f.feeStructure.feeType,
      })),
    },
    unreadMessages,
    unreadNotifications,
    announcements: announcements.map((a) => ({
      id: a.id,
      title: a.title,
      priority: a.priority,
      postedBy: `${a.postedByUser.firstName} ${a.postedByUser.lastName}`,
      createdAt: a.createdAt,
    })),
  };
}

export async function getMyChildren(userId: string, tenantId: string) {
  const parent = await prisma.parent.findUnique({
    where: { userId },
    include: {
      children: {
        include: {
          student: {
            include: {
              class: true,
              section: true,
              user: { select: { firstName: true, lastName: true, avatar: true, email: true, phone: true } },
            },
          },
        },
      },
    },
  });

  if (!parent || parent.tenantId !== tenantId) throw ApiError.notFound("Parent not found");

  return parent.children.map((c) => ({
    id: c.studentId,
    relation: c.relation,
    isPrimary: c.isPrimary,
    canPickup: c.canPickup,
    student: {
      ...c.student.user,
      rollNumber: c.student.rollNumber,
      class: c.student.class.name,
      section: c.student.section.name,
      status: c.student.status,
      bloodGroup: c.student.bloodGroup,
      medicalNotes: c.student.medicalNotes,
    },
  }));
}

export async function getChildDetail(parentId: string, tenantId: string, studentId: string) {
  const link = await prisma.studentParent.findFirst({
    where: { parentId, studentId },
    include: {
      student: {
        include: {
          class: true,
          section: true,
          user: { select: { firstName: true, lastName: true, avatar: true, email: true, phone: true } },
          attendances: { orderBy: { date: "desc" }, take: 10 },
          marks: { include: { subject: true }, orderBy: { createdAt: "desc" }, take: 10 },
          homeworkSubmissions: {
            include: { homework: { include: { subject: true } } },
            orderBy: { submittedAt: "desc" },
            take: 10,
          },
          results: { orderBy: { generatedAt: "desc" }, take: 5 },
          feeRecords: {
            where: { status: { in: ["UNPAID", "PARTIAL"] } },
            include: { feeStructure: true },
          },
        },
      },
    },
  });

  if (!link || link.student.tenantId !== tenantId) throw ApiError.notFound("Child not found or not your child");

  const s = link.student;
  return {
    id: s.userId,
    name: `${s.user.firstName} ${s.user.lastName}`,
    avatar: s.user.avatar,
    email: s.user.email,
    phone: s.user.phone,
    rollNumber: s.rollNumber,
    class: s.class.name,
    section: s.section.name,
    status: s.status,
    bloodGroup: s.bloodGroup,
    recentAttendance: s.attendances,
    recentMarks: s.marks,
    recentHomework: s.homeworkSubmissions,
    recentResults: s.results,
    pendingFee: s.feeRecords,
  };
}

// ═══════════════════════════════════════════════
// Attendance
// ═══════════════════════════════════════════════

export async function getChildAttendance(parentId: string, tenantId: string, studentId: string, month?: string) {
  const link = await prisma.studentParent.findFirst({ where: { parentId, studentId } });
  if (!link) throw ApiError.forbidden("Not your child");

  let startDate: Date, endDate: Date;
  if (month) {
    const [year, m] = month.split("-").map(Number);
    startDate = new Date(year, m - 1, 1);
    endDate = new Date(year, m, 0, 23, 59, 59, 999);
  } else {
    startDate = getStartOfMonth(new Date());
    endDate = getEndOfMonth(new Date());
  }

  return prisma.attendance.findMany({
    where: { studentId, tenantId, date: { gte: startDate, lte: endDate } },
    orderBy: { date: "desc" },
  });
}

export async function getChildAttendanceSummary(parentId: string, tenantId: string, studentId: string) {
  const link = await prisma.studentParent.findFirst({ where: { parentId, studentId } });
  if (!link) throw ApiError.forbidden("Not your child");

  const records = await prisma.attendance.findMany({
    where: { studentId, tenantId },
  });

  return summarizeAttendance(records);
}

// ═══════════════════════════════════════════════
// Homework
// ═══════════════════════════════════════════════

export async function getChildHomework(parentId: string, tenantId: string, studentId: string) {
  const link = await prisma.studentParent.findFirst({ where: { parentId, studentId } });
  if (!link) throw ApiError.forbidden("Not your child");

  const student = await prisma.student.findFirst({ where: { userId: studentId, tenantId } });
  if (!student) throw ApiError.notFound("Student not found");

  const homeworks = await prisma.homework.findMany({
    where: { classId: student.classId, sectionId: student.sectionId, tenantId, isActive: true },
    include: {
      subject: true,
      submissions: { where: { studentId } },
    },
    orderBy: { dueDate: "asc" },
  });

  return homeworks.map((h) => ({
    id: h.id,
    title: h.title,
    dueDate: h.dueDate,
    subject: h.subject.name,
    maxMarks: h.maxMarks,
    isSubmitted: h.submissions.length > 0,
    submissionStatus: h.submissions[0]?.status || null,
    submittedAt: h.submissions[0]?.submittedAt || null,
    marks: h.submissions[0]?.marks || null,
  }));
}

// ═══════════════════════════════════════════════
// Child Fee Records
// ═══════════════════════════════════════════════

export async function getChildFeeRecords(parentId: string, tenantId: string, studentId: string) {
  const link = await prisma.studentParent.findFirst({ where: { parentId, studentId } });
  if (!link) throw ApiError.forbidden("Not your child");

  return prisma.feeRecord.findMany({
    where: { studentId, tenantId },
    include: { feeStructure: true },
    orderBy: { dueDate: "desc" },
  });
}

export async function getChildFeeRecordDetail(parentId: string, tenantId: string, studentId: string, feeRecordId: string) {
  const link = await prisma.studentParent.findFirst({ where: { parentId, studentId } });
  if (!link) throw ApiError.forbidden("Not your child");

  const feeRecord = await prisma.feeRecord.findFirst({
    where: { id: feeRecordId, studentId, tenantId },
    include: { feeStructure: true },
  });

  if (!feeRecord) throw ApiError.notFound("Fee record not found");
  return feeRecord;
}

// ═══════════════════════════════════════════════
// Results & Marks
// ═══════════════════════════════════════════════

export async function getChildResults(parentId: string, tenantId: string, studentId: string) {
  const link = await prisma.studentParent.findFirst({ where: { parentId, studentId } });
  if (!link) throw ApiError.forbidden("Not your child");

  return prisma.result.findMany({
    where: { studentId, tenantId },
    include: { class: true, section: true },
    orderBy: { generatedAt: "desc" },
  });
}

export async function getChildMarks(parentId: string, tenantId: string, studentId: string) {
  const link = await prisma.studentParent.findFirst({ where: { parentId, studentId } });
  if (!link) throw ApiError.forbidden("Not your child");

  return prisma.mark.findMany({
    where: { studentId, tenantId },
    include: { subject: true, class: true, section: true },
    orderBy: { createdAt: "desc" },
  });
}

// ═══════════════════════════════════════════════
// Report Requests
// ═══════════════════════════════════════════════

export async function createReportRequest(
  parentId: string,
  tenantId: string,
  data: { studentId: string; teacherId: string; reportType: string }
) {
  const link = await prisma.studentParent.findFirst({ where: { parentId, studentId: data.studentId } });
  if (!link) throw ApiError.forbidden("Not your child");

  const request = await prisma.reportRequest.create({
    data: {
      tenantId,
      parentId,
      studentId: data.studentId,
      teacherId: data.teacherId,
      reportType: data.reportType as any,
      status: "PENDING",
    },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      teacher: { select: { firstName: true, lastName: true } },
    },
  });

  // Notify teacher
  await prisma.notification.create({
    data: {
      tenantId,
      userId: data.teacherId,
      title: "New Report Request",
      body: `${request.student.user.firstName}'s parent requested a ${data.reportType.toLowerCase()} report.`,
      type: "REPORT_READY",
      data: { reportRequestId: request.id },
      senderId: parentId,
    },
  });

  return request;
}

export async function getMyReportRequests(parentId: string, tenantId: string) {
  return prisma.reportRequest.findMany({
    where: { parentId, tenantId },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      teacher: { select: { firstName: true, lastName: true } },
    },
    orderBy: { requestedAt: "desc" },
  });
}

export async function getReportRequestDetail(parentId: string, tenantId: string, requestId: string) {
  const request = await prisma.reportRequest.findFirst({
    where: { id: requestId, parentId, tenantId },
    include: {
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      teacher: { select: { firstName: true, lastName: true } },
    },
  });

  if (!request) throw ApiError.notFound("Report request not found");
  return request;
}

// ═══════════════════════════════════════════════
// Q&A
// ═══════════════════════════════════════════════

export async function askQuestion(
  parentId: string,
  tenantId: string,
  data: { teacherId: string; question: string }
) {
  const message = await prisma.message.create({
    data: {
      tenantId,
      senderId: parentId,
      receiverId: data.teacherId,
      content: data.question,
      messageType: "TEXT",
    },
  });

  await prisma.notification.create({
    data: {
      tenantId,
      userId: data.teacherId,
      title: "New Parent Question",
      body: data.question.substring(0, 100),
      type: "MESSAGE",
      data: { messageId: message.id },
      senderId: parentId,
    },
  });

  return message;
}

export async function getMyQA(parentId: string, tenantId: string) {
  return prisma.message.findMany({
    where: {
      tenantId,
      OR: [{ senderId: parentId }, { receiverId: parentId }],
    },
    include: {
      sender: { select: { firstName: true, lastName: true, role: true } },
      receiver: { select: { firstName: true, lastName: true, role: true } },
      replyTo: true,
      replies: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

// ═══════════════════════════════════════════════
// Fee
// ═══════════════════════════════════════════════

export async function getFeeRecords(parentId: string, tenantId: string) {
  const parent = await prisma.parent.findUnique({
    where: { userId: parentId },
    include: {
      children: { select: { studentId: true } },
    },
  });

  if (!parent || parent.tenantId !== tenantId) throw ApiError.notFound("Parent not found");

  const childIds = parent.children.map((c) => c.studentId);

  return prisma.feeRecord.findMany({
    where: { studentId: { in: childIds }, tenantId },
    include: {
      feeStructure: true,
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { dueDate: "desc" },
  });
}

export async function getFeeRecordDetail(parentId: string, tenantId: string, feeRecordId: string) {
  const parent = await prisma.parent.findUnique({
    where: { userId: parentId },
    include: { children: { select: { studentId: true } } },
  });

  if (!parent || parent.tenantId !== tenantId) throw ApiError.notFound("Parent not found");

  const childIds = parent.children.map((c) => c.studentId);

  const feeRecord = await prisma.feeRecord.findFirst({
    where: { id: feeRecordId, studentId: { in: childIds }, tenantId },
    include: {
      feeStructure: true,
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  });

  if (!feeRecord) throw ApiError.notFound("Fee record not found");
  return feeRecord;
}

export async function getFeeDue(parentId: string, tenantId: string) {
  const parent = await prisma.parent.findUnique({
    where: { userId: parentId },
    include: { children: { select: { studentId: true } } },
  });

  if (!parent || parent.tenantId !== tenantId) throw ApiError.notFound("Parent not found");

  const childIds = parent.children.map((c) => c.studentId);

  return prisma.feeRecord.findMany({
    where: {
      studentId: { in: childIds },
      tenantId,
      status: { in: ["UNPAID", "PARTIAL"] },
      dueDate: { gte: new Date() },
    },
    include: {
      feeStructure: true,
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: { dueDate: "asc" },
  });
}

// ═══════════════════════════════════════════════
// Messages
// ═══════════════════════════════════════════════

export async function getParentMessages(parentId: string, tenantId: string) {
  const messages = await prisma.message.findMany({
    where: {
      tenantId,
      OR: [{ senderId: parentId }, { receiverId: parentId }],
    },
    include: {
      sender: { select: { firstName: true, lastName: true, role: true, avatar: true } },
      receiver: { select: { firstName: true, lastName: true, role: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const threads = new Map<string, any>();
  for (const m of messages) {
    const partnerId = m.senderId === parentId ? m.receiverId : m.senderId;
    if (!threads.has(partnerId)) {
      threads.set(partnerId, {
        partnerId,
        partnerName: m.senderId === parentId
          ? `${m.receiver.firstName} ${m.receiver.lastName}`
          : `${m.sender.firstName} ${m.sender.lastName}`,
        partnerRole: m.senderId === parentId ? m.receiver.role : m.sender.role,
        partnerAvatar: m.senderId === parentId ? m.receiver.avatar : m.sender.avatar,
        lastMessage: m.content,
        lastMessageAt: m.createdAt,
        unreadCount: 0,
      });
    }
    if (m.receiverId === parentId && !m.isRead) {
      threads.get(partnerId).unreadCount++;
    }
  }

  return Array.from(threads.values()).sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

export async function sendParentMessage(
  parentId: string,
  tenantId: string,
  data: { receiverId: string; content: string; attachments?: any[] }
) {
  const message = await prisma.message.create({
    data: {
      tenantId,
      senderId: parentId,
      receiverId: data.receiverId,
      content: data.content,
      attachments: data.attachments as any,
      messageType: "TEXT",
    },
    include: {
      sender: { select: { firstName: true, lastName: true } },
      receiver: { select: { firstName: true, lastName: true } },
    },
  });

  await prisma.notification.create({
    data: {
      tenantId,
      userId: data.receiverId,
      title: "New Message",
      body: data.content.substring(0, 100),
      type: "MESSAGE",
      data: { messageId: message.id },
      senderId: parentId,
    },
  });

  return message;
}

// ═══════════════════════════════════════════════
// Notifications
// ═══════════════════════════════════════════════

export async function getParentNotifications(parentId: string, tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: parentId, tenantId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId: parentId, tenantId } }),
  ]);

  return { notifications, total, page, limit };
}

export async function markNotificationRead(parentId: string, tenantId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId: parentId, tenantId },
  });

  if (!notification) throw ApiError.notFound("Notification not found");

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  });
}
