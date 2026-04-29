// ═══════════════════════════════════════════════════
// Principal Service
// ═══════════════════════════════════════════════════

import { PrismaClient, NotificationType, Prisma } from '@prisma/client';
import type { CreateAnnouncementData } from './principal.controller';

const prisma = new PrismaClient();

// ── Dashboard Stats ──

export async function getDashboardStats(tenantId: string, date?: string) {
  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);

  const [
    teacherCount,
    studentCount,
    parentCount,
    adminCount,
    attendanceStats,
    feeRecords,
    pendingReports,
    unreadMessages,
  ] = await Promise.all([
    prisma.teacher.count({ where: { tenantId, user: { isActive: true } } }),
    prisma.student.count({ where: { tenantId, status: 'ACTIVE', user: { isActive: true } } }),
    prisma.parent.count({ where: { tenantId, user: { isActive: true } } }),
    prisma.schoolAdmin.count({ where: { tenantId, user: { isActive: true } } }),
    prisma.attendance.groupBy({
      by: ['status'],
      where: { tenantId, date: { gte: targetDate, lt: nextDate } },
      _count: { status: true },
    }),
    prisma.feeRecord.findMany({
      where: { tenantId, createdAt: { gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), 1) } },
      select: { paidAmount: true },
    }),
    prisma.reportRequest.count({ where: { tenantId, status: 'PENDING' } }),
    prisma.message.count({ where: { receiverId: tenantId /* placeholder — actual requires user id */ } }),
  ]);

  const present = attendanceStats.find((a) => a.status === 'PRESENT')?._count.status || 0;
  const absent = attendanceStats.find((a) => a.status === 'ABSENT')?._count.status || 0;
  const late = attendanceStats.find((a) => a.status === 'LATE')?._count.status || 0;
  const totalAttendance = present + absent + late;

  const feeCollectionThisMonth = feeRecords.reduce((sum, r) => sum + Number(r.paidAmount), 0);

  return {
    teacherCount,
    studentCount,
    parentCount,
    adminCount,
    attendanceToday: { present, absent, late, total: totalAttendance },
    feeCollectionThisMonth,
    pendingReports,
    unreadMessages: 0, // requires actual principal user id
  };
}

// ── List Teachers ──

export async function listTeachers(tenantId: string, options: ListQueryOptions) {
  const { page, limit, search, sortBy, sortOrder } = options;
  const where: Prisma.TeacherWhereInput = { tenantId, user: { isActive: true } };
  if (search) {
    where.user = {
      isActive: true,
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { uniqueId: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [teachers, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      include: {
        user: { select: { id: true, uniqueId: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, isActive: true } },
        assignedClass: { select: { id: true, name: true } },
        assignedSection: { select: { id: true, name: true } },
      },
      orderBy: { user: { [sortBy]: sortOrder } },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.teacher.count({ where }),
  ]);

  return { teachers, total };
}

// ── List Students ──

export async function listStudents(tenantId: string, options: ListQueryOptions & { classId?: string; sectionId?: string }) {
  const { page, limit, search, sortBy, sortOrder, classId, sectionId } = options;
  const where: Prisma.StudentWhereInput = { tenantId, status: 'ACTIVE', user: { isActive: true } };
  if (classId) where.classId = classId;
  if (sectionId) where.sectionId = sectionId;
  if (search) {
    where.user = {
      isActive: true,
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { uniqueId: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        user: { select: { id: true, uniqueId: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, isActive: true } },
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
      },
      orderBy: { user: { [sortBy]: sortOrder } },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.student.count({ where }),
  ]);

  return { students, total };
}

// ── List Parents ──

export async function listParents(tenantId: string, options: ListQueryOptions) {
  const { page, limit, search, sortBy, sortOrder } = options;
  const where: Prisma.ParentWhereInput = { tenantId, user: { isActive: true } };
  if (search) {
    where.user = {
      isActive: true,
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { uniqueId: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [parents, total] = await Promise.all([
    prisma.parent.findMany({
      where,
      include: {
        user: { select: { id: true, uniqueId: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, isActive: true } },
        children: {
          include: {
            student: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true } },
                class: { select: { id: true, name: true } },
                section: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { user: { [sortBy]: sortOrder } },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.parent.count({ where }),
  ]);

  return { parents, total };
}

// ── List Admins ──

export async function listAdmins(tenantId: string, options: ListQueryOptions) {
  const { page, limit, search, sortBy, sortOrder } = options;
  const where: Prisma.SchoolAdminWhereInput = { tenantId, user: { isActive: true } };
  if (search) {
    where.user = {
      isActive: true,
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { uniqueId: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [admins, total] = await Promise.all([
    prisma.schoolAdmin.findMany({
      where,
      include: {
        user: { select: { id: true, uniqueId: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, isActive: true } },
      },
      orderBy: { user: { [sortBy]: sortOrder } },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.schoolAdmin.count({ where }),
  ]);

  return { admins, total };
}

// ── Create Announcement ──

export async function createAnnouncement(data: CreateAnnouncementData) {
  return prisma.announcement.create({
    data: {
      tenantId: data.tenantId,
      postedBy: data.postedBy,
      title: data.title,
      content: data.content,
      priority: data.priority,
      targetAudience: data.targetAudience,
      targetClassId: data.targetClassId || null,
      targetSectionId: data.targetSectionId || null,
      expiresAt: data.expiresAt || null,
    },
  });
}

// ── List Principal Announcements ──

export async function listAnnouncements(tenantId: string, postedBy: string, options: ListQueryOptions) {
  const { page, limit, sortBy, sortOrder } = options;
  const where: Prisma.AnnouncementWhereInput = { tenantId, postedBy };

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.announcement.count({ where }),
  ]);

  return { announcements, total };
}

// ── Delete Announcement ──

export async function deleteAnnouncement(id: string, tenantId: string, postedBy: string) {
  return prisma.announcement.deleteMany({
    where: { id, tenantId, postedBy },
  });
}

// ── Send Message ──

export async function sendMessage(
  tenantId: string,
  senderId: string,
  receiverId: string,
  content: string,
  messageType: string,
  attachments?: unknown[]
) {
  return prisma.message.create({
    data: {
      tenantId,
      senderId,
      receiverId,
      content,
      messageType: messageType as any,
      attachments: attachments ? (JSON.parse(JSON.stringify(attachments)) as Prisma.JsonArray) : undefined,
    },
  });
}

// ── Get Message Threads ──

export async function getMessageThreads(userId: string, tenantId: string, options: ListQueryOptions) {
  const { page, limit } = options;

  const where: Prisma.MessageWhereInput = {
    tenantId,
    OR: [{ senderId: userId }, { receiverId: userId }],
  };

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true, avatar: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, role: true, avatar: true } },
      },
    }),
    prisma.message.count({ where }),
  ]);

  return { messages, total };
}

// ── Send Bulk Notification ──

export async function sendBulkNotification(
  tenantId: string,
  senderId: string,
  targetRole: string,
  title: string,
  body: string,
  type: NotificationType,
  targetClassId?: string,
  data?: Record<string, unknown>
) {
  let userIds: string[] = [];

  if (targetRole === 'ALL') {
    const users = await prisma.user.findMany({
      where: { tenantId, isActive: true, role: { in: ['TEACHER', 'STUDENT', 'PARENT', 'ADMIN', 'PRINCIPAL'] } },
      select: { id: true },
    });
    userIds = users.map((u) => u.id);
  } else {
    let roleFilter: string;
    switch (targetRole) {
      case 'TEACHERS': roleFilter = 'TEACHER'; break;
      case 'STUDENTS': roleFilter = 'STUDENT'; break;
      case 'PARENTS': roleFilter = 'PARENT'; break;
      case 'ADMIN': roleFilter = 'ADMIN'; break;
      default: roleFilter = targetRole;
    }
    const users = await prisma.user.findMany({
      where: { tenantId, isActive: true, role: roleFilter as any },
      select: { id: true },
    });
    userIds = users.map((u) => u.id);
  }

  if (targetClassId) {
    const classStudents = await prisma.student.findMany({
      where: { tenantId, classId: targetClassId, user: { isActive: true } },
      select: { userId: true },
    });
    const classStudentIds = classStudents.map((s) => s.userId);
    const parents = await prisma.studentParent.findMany({
      where: { studentId: { in: classStudentIds } },
      select: { parentId: true },
    });
    const parentUserIds = parents.map((p) => p.parentId);
    userIds = [...new Set([...classStudentIds, ...parentUserIds])];
  }

  if (userIds.length === 0) return { count: 0 };

  await prisma.$transaction(
    userIds.map((uid) =>
      prisma.notification.create({
        data: {
          tenantId,
          userId: uid,
          title,
          body,
          type,
          senderId,
          data: data ? (JSON.parse(JSON.stringify(data)) as Prisma.JsonObject) : undefined,
        },
      })
    )
  );

  return { count: userIds.length };
}

// ── Attendance Summary ──

export async function getAttendanceSummary(
  tenantId: string,
  period: string,
  date?: string,
  month?: number,
  year?: number
) {
  if (period === 'daily') {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const stats = await prisma.attendance.groupBy({
      by: ['status'],
      where: { tenantId, date: { gte: targetDate, lt: nextDate } },
      _count: { status: true },
    });

    return { period: 'daily', date: targetDate.toISOString().split('T')[0], stats };
  }

  if (period === 'monthly') {
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;
    const from = new Date(targetYear, targetMonth - 1, 1);
    const to = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const stats = await prisma.attendance.groupBy({
      by: ['status'],
      where: { tenantId, date: { gte: from, lte: to } },
      _count: { status: true },
    });

    const byDate = await prisma.attendance.groupBy({
      by: ['date', 'status'],
      where: { tenantId, date: { gte: from, lte: to } },
      _count: { status: true },
    });

    return { period: 'monthly', month: targetMonth, year: targetYear, stats, byDate };
  }

  // weekly
  const targetDate = date ? new Date(date) : new Date();
  const weekStart = new Date(targetDate);
  weekStart.setDate(targetDate.getDate() - targetDate.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const stats = await prisma.attendance.groupBy({
    by: ['status'],
    where: { tenantId, date: { gte: weekStart, lt: weekEnd } },
    _count: { status: true },
  });

  return { period: 'weekly', weekStart: weekStart.toISOString().split('T')[0], stats };
}

// ── Fee Summary ──

export async function getFeeSummary(tenantId: string, month?: number, year?: number) {
  const targetYear = year || new Date().getFullYear();
  const targetMonth = month || new Date().getMonth() + 1;
  const from = new Date(targetYear, targetMonth - 1, 1);
  const to = new Date(targetYear, targetMonth, 0, 23, 59, 59);

  const [feeRecords, totalDue, totalPaid, totalPending] = await Promise.all([
    prisma.feeRecord.findMany({
      where: { tenantId, createdAt: { gte: from, lte: to } },
      select: { status: true, paidAmount: true, finalAmount: true, balance: true },
    }),
    prisma.feeRecord.aggregate({
      where: { tenantId },
      _sum: { finalAmount: true },
    }),
    prisma.feeRecord.aggregate({
      where: { tenantId, status: 'PAID' },
      _sum: { paidAmount: true },
    }),
    prisma.feeRecord.count({ where: { tenantId, status: 'UNPAID' } }),
  ]);

  const paidThisMonth = feeRecords.filter((f) => f.status === 'PAID').reduce((s, f) => s + Number(f.paidAmount), 0);

  return {
    month: targetMonth,
    year: targetYear,
    totalDue: Number(totalDue._sum.finalAmount) || 0,
    totalCollected: Number(totalPaid._sum.paidAmount) || 0,
    paidThisMonth,
    pendingCount: totalPending,
  };
}

// ── Performance Overview ──

export async function getPerformanceOverview(
  tenantId: string,
  classId?: string,
  sectionId?: string,
  term?: string,
  academicYear?: string
) {
  const currentYear = academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  const where: Prisma.ResultWhereInput = { tenantId, academicYear: currentYear };
  if (classId) where.classId = classId;
  if (sectionId) where.sectionId = sectionId;
  if (term) where.term = term as any;

  const [results, classWise, subjectWise] = await Promise.all([
    prisma.result.findMany({ where }),
    prisma.result.groupBy({
      by: ['classId'],
      where,
      _avg: { percentage: true },
    }),
    prisma.resultDetail.groupBy({
      by: ['subjectId'],
      where: { result: { tenantId, academicYear: currentYear } },
      _avg: { obtainedMarks: true, totalMarks: true },
    }),
  ]);

  const passCount = results.filter((r) => r.status === 'PASS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;

  return {
    academicYear: currentYear,
    term,
    totalResults: results.length,
    passCount,
    failCount,
    averagePercentage: results.length > 0 ? results.reduce((s, r) => s + r.percentage, 0) / results.length : 0,
    classWise,
    subjectWise,
  };
}

// ── School Reports ──

export async function getSchoolReports(
  tenantId: string,
  type: string,
  from?: string,
  to?: string,
  classId?: string
) {
  const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), 0, 1);
  const toDate = to ? new Date(to) : new Date();

  switch (type) {
    case 'enrollment': {
      const [teacherCount, studentCount, parentCount, adminCount] = await Promise.all([
        prisma.teacher.count({ where: { tenantId, user: { isActive: true } } }),
        prisma.student.count({ where: { tenantId, status: 'ACTIVE' } }),
        prisma.parent.count({ where: { tenantId, user: { isActive: true } } }),
        prisma.schoolAdmin.count({ where: { tenantId, user: { isActive: true } } }),
      ]);
      return { type: 'enrollment', teacherCount, studentCount, parentCount, adminCount };
    }

    case 'attendance': {
      const stats = await prisma.attendance.groupBy({
        by: ['status'],
        where: { tenantId, date: { gte: fromDate, lte: toDate } },
        _count: { status: true },
      });
      return { type: 'attendance', from, to, stats };
    }

    case 'performance': {
      const results = await prisma.result.findMany({
        where: { tenantId, generatedAt: { gte: fromDate, lte: toDate } },
      });
      return {
        type: 'performance',
        from,
        to,
        totalResults: results.length,
        passCount: results.filter((r) => r.status === 'PASS').length,
        failCount: results.filter((r) => r.status === 'FAIL').length,
      };
    }

    case 'fee': {
      const feeRecords = await prisma.feeRecord.findMany({
        where: { tenantId, createdAt: { gte: fromDate, lte: toDate } },
      });
      const collected = feeRecords.filter((f) => f.status === 'PAID').reduce((s, f) => s + Number(f.paidAmount), 0);
      const due = feeRecords.reduce((s, f) => s + Number(f.finalAmount), 0);
      return { type: 'fee', from, to, totalCollected: collected, totalDue: due, recordCount: feeRecords.length };
    }

    default:
      return { type: 'unknown', message: 'Report type not supported' };
  }
}

// ── Shared Types ──

export interface ListQueryOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
