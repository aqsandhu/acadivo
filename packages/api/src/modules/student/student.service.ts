// ─────────────────────────────────────────────
// Student Service — Business logic for student academic workflows
// ─────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { summarizeAttendance, getStartOfMonth, getEndOfMonth, isLateSubmission } from "../../lib/academic";

// ═══════════════════════════════════════════════
// Dashboard & Profile
// ═══════════════════════════════════════════════

export async function getStudentDashboard(userId: string, tenantId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      class: true,
      section: true,
      user: { select: { firstName: true, lastName: true, avatar: true } },
    },
  });

  if (!student) throw ApiError.notFound("Student profile not found");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();

  // Today's classes
  const classesToday = await prisma.classSchedule.findMany({
    where: { classId: student.classId, sectionId: student.sectionId, dayOfWeek, tenantId, isActive: true },
    include: { subject: true, teacher: { include: { user: { select: { firstName: true, lastName: true } } } } },
    orderBy: { periodNumber: "asc" },
  });

  // Pending homework
  const pendingHomework = await prisma.homework.count({
    where: {
      classId: student.classId,
      sectionId: student.sectionId,
      tenantId,
      dueDate: { gte: today },
      isActive: true,
      submissions: { none: { studentId: userId } },
    },
  });

  // Announcements
  const announcements = await prisma.announcement.findMany({
    where: {
      tenantId,
      OR: [
        { targetAudience: "ALL" },
        { targetAudience: "STUDENTS" },
        { targetAudience: "CLASS", targetClassId: student.classId },
      ],
      expiresAt: { gte: new Date() },
    },
    include: { postedByUser: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Attendance streak
  const attendanceRecords = await prisma.attendance.findMany({
    where: { studentId: userId, tenantId },
    orderBy: { date: "desc" },
    take: 30,
  });

  let streak = 0;
  for (const r of attendanceRecords) {
    if (r.status === "PRESENT") streak++;
    else break;
  }

  return {
    student: {
      id: userId,
      name: `${student.user.firstName} ${student.user.lastName}`,
      avatar: student.user.avatar,
      rollNumber: student.rollNumber,
      class: student.class.name,
      section: student.section.name,
    },
    classesToday: classesToday.map((c) => ({
      id: c.id,
      period: c.periodNumber,
      time: `${c.startTime} - ${c.endTime}`,
      subject: c.subject.name,
      teacher: `${c.teacher.user.firstName} ${c.teacher.user.lastName}`,
      room: c.roomNumber,
    })),
    pendingHomework,
    announcements: announcements.map((a) => ({
      id: a.id,
      title: a.title,
      priority: a.priority,
      postedBy: `${a.postedByUser.firstName} ${a.postedByUser.lastName}`,
      createdAt: a.createdAt,
    })),
    attendanceStreak: streak,
  };
}

export async function getStudentProfile(userId: string, tenantId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      class: true,
      section: true,
      user: { select: { firstName: true, lastName: true, email: true, phone: true, avatar: true, gender: true, dateOfBirth: true, address: true, city: true } },
      parentLinks: { include: { parent: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } } } },
    },
  });

  if (!student) throw ApiError.notFound("Student profile not found");

  return {
    id: userId,
    ...student.user,
    rollNumber: student.rollNumber,
    class: student.class.name,
    section: student.section.name,
    bloodGroup: student.bloodGroup,
    medicalNotes: student.medicalNotes,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    guardianRelation: student.guardianRelation,
    status: student.status,
    parents: student.parentLinks.map((pl) => ({
      relation: pl.relation,
      name: `${pl.parent.user.firstName} ${pl.parent.user.lastName}`,
      phone: pl.parent.user.phone,
      isPrimary: pl.isPrimary,
    })),
  };
}

export async function updateStudentProfile(
  userId: string,
  tenantId: string,
  data: { avatar?: string; address?: string; phone?: string }
) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student || student.tenantId !== tenantId) throw ApiError.notFound("Student profile not found");

  const updateData: Prisma.UserUpdateInput = {};
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.phone !== undefined) updateData.phone = data.phone;

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, address: true, city: true },
  });
}

// ═══════════════════════════════════════════════
// Attendance
// ═══════════════════════════════════════════════

export async function getStudentAttendance(userId: string, tenantId: string, month?: string) {
  let startDate: Date, endDate: Date;
  if (month) {
    const [year, m] = month.split("-").map(Number);
    startDate = new Date(year, m - 1, 1);
    endDate = new Date(year, m, 0, 23, 59, 59, 999);
  } else {
    startDate = getStartOfMonth(new Date());
    endDate = getEndOfMonth(new Date());
  }

  const records = await prisma.attendance.findMany({
    where: { studentId: userId, tenantId, date: { gte: startDate, lte: endDate } },
    orderBy: { date: "desc" },
  });

  return records;
}

export async function getStudentAttendanceSummary(userId: string, tenantId: string) {
  const records = await prisma.attendance.findMany({
    where: { studentId: userId, tenantId },
  });

  return summarizeAttendance(records);
}

// ═══════════════════════════════════════════════
// Homework
// ═══════════════════════════════════════════════

export async function getPendingHomework(userId: string, tenantId: string) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student || student.tenantId !== tenantId) throw ApiError.notFound("Student not found");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const homeworks = await prisma.homework.findMany({
    where: {
      classId: student.classId,
      sectionId: student.sectionId,
      tenantId,
      isActive: true,
      dueDate: { gte: today },
    },
    include: {
      subject: true,
      teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
      submissions: { where: { studentId: userId } },
    },
    orderBy: { dueDate: "asc" },
  });

  return homeworks.map((h) => ({
    id: h.id,
    title: h.title,
    description: h.description,
    dueDate: h.dueDate,
    subject: h.subject.name,
    teacher: `${h.teacher.user.firstName} ${h.teacher.user.lastName}`,
    maxMarks: h.maxMarks,
    attachments: h.attachments,
    isSubmitted: h.submissions.length > 0,
    submissionStatus: h.submissions[0]?.status || null,
    submittedAt: h.submissions[0]?.submittedAt || null,
  }));
}

export async function getHomeworkDetail(userId: string, tenantId: string, homeworkId: string) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student || student.tenantId !== tenantId) throw ApiError.notFound("Student not found");

  const homework = await prisma.homework.findFirst({
    where: { id: homeworkId, classId: student.classId, sectionId: student.sectionId, tenantId, isActive: true },
    include: {
      subject: true,
      teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
      submissions: { where: { studentId: userId } },
    },
  });

  if (!homework) throw ApiError.notFound("Homework not found");
  return homework;
}

export async function submitHomework(
  userId: string,
  tenantId: string,
  homeworkId: string,
  data: { submissionText?: string; attachments?: any[] }
) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student || student.tenantId !== tenantId) throw ApiError.notFound("Student not found");

  const homework = await prisma.homework.findFirst({
    where: { id: homeworkId, classId: student.classId, sectionId: student.sectionId, tenantId, isActive: true },
  });

  if (!homework) throw ApiError.notFound("Homework not found");

  const submittedAt = new Date();
  const late = isLateSubmission(submittedAt, homework.dueDate);

  const existing = await prisma.homeworkSubmission.findUnique({
    where: { homeworkId_studentId: { homeworkId, studentId: userId } },
  });

  if (existing) {
    return prisma.homeworkSubmission.update({
      where: { id: existing.id },
      data: {
        submissionText: data.submissionText,
        attachments: data.attachments as any,
        submittedAt,
        status: late ? "LATE" : "SUBMITTED",
      },
    });
  }

  return prisma.homeworkSubmission.create({
    data: {
      tenantId,
      homeworkId,
      studentId: userId,
      submissionText: data.submissionText,
      attachments: data.attachments as any,
      submittedAt,
      status: late ? "LATE" : "SUBMITTED",
    },
  });
}

export async function getMySubmissions(userId: string, tenantId: string) {
  const submissions = await prisma.homeworkSubmission.findMany({
    where: { studentId: userId, tenantId },
    include: {
      homework: { include: { subject: true } },
      gradedByTeacher: { select: { firstName: true, lastName: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return submissions;
}

// ═══════════════════════════════════════════════
// Q&A
// ═══════════════════════════════════════════════

export async function askQuestion(
  userId: string,
  tenantId: string,
  data: { teacherId: string; subjectId: string; question: string }
) {
  // Verify teacher teaches this student's class
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student || student.tenantId !== tenantId) throw ApiError.notFound("Student not found");

  const assignment = await prisma.teacherSubject.findFirst({
    where: { teacherId: data.teacherId, tenantId, classId: student.classId, sectionId: student.sectionId },
  });

  if (!assignment) throw ApiError.forbidden("Selected teacher does not teach your class");

  const message = await prisma.message.create({
    data: {
      tenantId,
      senderId: userId,
      receiverId: data.teacherId,
      content: data.question,
      messageType: "TEXT",
    },
  });

  // Notify teacher
  await prisma.notification.create({
    data: {
      tenantId,
      userId: data.teacherId,
      title: "New Student Question",
      body: data.question.substring(0, 100),
      type: "MESSAGE",
      data: { messageId: message.id, studentId: userId },
      senderId: userId,
    },
  });

  return message;
}

export async function getMyQA(userId: string, tenantId: string) {
  const messages = await prisma.message.findMany({
    where: {
      tenantId,
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: { firstName: true, lastName: true, role: true } },
      receiver: { select: { firstName: true, lastName: true, role: true } },
      replyTo: true,
      replies: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return messages;
}

export async function getPublicQA(userId: string, tenantId: string) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student || student.tenantId !== tenantId) throw ApiError.notFound("Student not found");

  // Return Q&A threads for student's class
  const teacherSubjects = await prisma.teacherSubject.findMany({
    where: { classId: student.classId, sectionId: student.sectionId, tenantId, isActive: true },
    select: { teacherId: true },
    distinct: ["teacherId"],
  });

  const teacherIds = teacherSubjects.map((ts) => ts.teacherId);

  const questions = await prisma.message.findMany({
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
  });

  return questions;
}

// ═══════════════════════════════════════════════
// Results
// ═══════════════════════════════════════════════

export async function getStudentResults(userId: string, tenantId: string) {
  const results = await prisma.result.findMany({
    where: { studentId: userId, tenantId },
    include: { class: true, section: true },
    orderBy: { generatedAt: "desc" },
  });

  return results;
}

export async function getResultDetail(userId: string, tenantId: string, resultId: string) {
  const result = await prisma.result.findFirst({
    where: { id: resultId, studentId: userId, tenantId },
    include: {
      class: true,
      section: true,
      resultDetails: { include: { subject: true } },
    },
  });

  if (!result) throw ApiError.notFound("Result not found");
  return result;
}

export async function getStudentMarks(userId: string, tenantId: string) {
  const marks = await prisma.mark.findMany({
    where: { studentId: userId, tenantId },
    include: { subject: true, class: true, section: true },
    orderBy: { createdAt: "desc" },
  });

  return marks;
}

// ═══════════════════════════════════════════════
// Fee Records
// ═══════════════════════════════════════════════

export async function getStudentFeeRecords(userId: string, tenantId: string) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student || student.tenantId !== tenantId) throw ApiError.notFound("Student not found");

  return prisma.feeRecord.findMany({
    where: { studentId: userId, tenantId },
    include: { feeStructure: true },
    orderBy: { dueDate: "desc" },
  });
}

export async function getStudentFeeRecordDetail(userId: string, tenantId: string, feeRecordId: string) {
  const feeRecord = await prisma.feeRecord.findFirst({
    where: { id: feeRecordId, studentId: userId, tenantId },
    include: { feeStructure: true },
  });

  if (!feeRecord) throw ApiError.notFound("Fee record not found");
  return feeRecord;
}

// ═══════════════════════════════════════════════
// Attendance History (Paginated + Date Range)
// ═══════════════════════════════════════════════

export async function getStudentAttendanceHistory(
  userId: string,
  tenantId: string,
  options: { page: number; limit: number; from?: string; to?: string }
) {
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (options.from) {
    startDate = new Date(options.from);
    startDate.setHours(0, 0, 0, 0);
  }
  if (options.to) {
    endDate = new Date(options.to);
    endDate.setHours(23, 59, 59, 999);
  }

  const where: Prisma.AttendanceWhereInput = { studentId: userId, tenantId };
  if (startDate || endDate) {
    where.date = {};
    if (startDate) (where.date as any).gte = startDate;
    if (endDate) (where.date as any).lte = endDate;
  }

  const skip = (options.page - 1) * options.limit;
  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: { class: true, section: true },
      orderBy: { date: "desc" },
      skip,
      take: options.limit,
    }),
    prisma.attendance.count({ where }),
  ]);

  return { records, total };
}

// ═══════════════════════════════════════════════
// Timetable
// ═══════════════════════════════════════════════

export async function getStudentTimetable(userId: string, tenantId: string) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student || student.tenantId !== tenantId) throw ApiError.notFound("Student not found");

  const schedules = await prisma.classSchedule.findMany({
    where: { classId: student.classId, sectionId: student.sectionId, tenantId, isActive: true },
    include: {
      subject: true,
      teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
    orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
  });

  const grouped: Record<number, any[]> = {};
  for (const s of schedules) {
    if (!grouped[s.dayOfWeek]) grouped[s.dayOfWeek] = [];
    grouped[s.dayOfWeek].push({
      id: s.id,
      period: s.periodNumber,
      startTime: s.startTime,
      endTime: s.endTime,
      subject: s.subject.name,
      teacher: `${s.teacher.user.firstName} ${s.teacher.user.lastName}`,
      room: s.roomNumber,
    });
  }

  return grouped;
}

// ═══════════════════════════════════════════════
// Notifications
// ═══════════════════════════════════════════════

export async function getStudentNotifications(userId: string, tenantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId, tenantId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId, tenantId } }),
  ]);

  return { notifications, total, page, limit };
}

export async function markNotificationRead(userId: string, tenantId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId, tenantId },
  });

  if (!notification) throw ApiError.notFound("Notification not found");

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string, tenantId: string) {
  return prisma.notification.updateMany({
    where: { userId, tenantId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

// ═══════════════════════════════════════════════
// Messages
// ═══════════════════════════════════════════════

export async function getStudentMessages(userId: string, tenantId: string) {
  const messages = await prisma.message.findMany({
    where: {
      tenantId,
      OR: [{ senderId: userId }, { receiverId: userId }],
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
    const partnerId = m.senderId === userId ? m.receiverId : m.senderId;
    if (!threads.has(partnerId)) {
      threads.set(partnerId, {
        partnerId,
        partnerName: m.senderId === userId
          ? `${m.receiver.firstName} ${m.receiver.lastName}`
          : `${m.sender.firstName} ${m.sender.lastName}`,
        partnerRole: m.senderId === userId ? m.receiver.role : m.sender.role,
        partnerAvatar: m.senderId === userId ? m.receiver.avatar : m.sender.avatar,
        lastMessage: m.content,
        lastMessageAt: m.createdAt,
        unreadCount: 0,
      });
    }
    if (m.receiverId === userId && !m.isRead) {
      threads.get(partnerId).unreadCount++;
    }
  }

  return Array.from(threads.values()).sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

export async function sendStudentMessage(
  userId: string,
  tenantId: string,
  data: { receiverId: string; content: string; attachments?: any[] }
) {
  const message = await prisma.message.create({
    data: {
      tenantId,
      senderId: userId,
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
      senderId: userId,
    },
  });

  return message;
}
