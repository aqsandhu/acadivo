// ═══════════════════════════════════════════════════
// Principal Controller
// ═══════════════════════════════════════════════════

import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import {
  successResponse,
  errorResponse,
  paginate,
} from '../../utils/response';
import * as PrincipalService from './principal.service';
import * as NotificationService from '../../services/notification.service';

// ── Types ──

export interface CreateAnnouncementData {
  tenantId: string;
  postedBy: string;
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  targetAudience: 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'ADMIN' | 'CLASS';
  targetClassId?: string;
  targetSectionId?: string;
  expiresAt?: Date;
}

// ── Helpers ──

function getTenantAndUser(req: Request): { tenantId: string; userId: string } | null {
  const tenantId = req.user?.tenantId;
  const userId = req.user?.userId;
  if (!tenantId || !userId) return null;
  return { tenantId, userId };
}

function getPagination(req: Request) {
  const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));
  const search = (req.query.search as string) || undefined;
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
  return { page, limit, search, sortBy, sortOrder };
}

// ═══════════════════════════════════════════════════
// Dashboard
// ═══════════════════════════════════════════════════

export async function getDashboard(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const date = (req.query.date as string) || undefined;
    const stats = await PrincipalService.getDashboardStats(ctx.tenantId, date);
    return res.json(successResponse(stats, 'Dashboard stats retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Teachers
// ═══════════════════════════════════════════════════

export async function getTeachers(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit, search, sortBy, sortOrder } = getPagination(req);
    const { teachers, total } = await PrincipalService.listTeachers(ctx.tenantId, {
      page, limit, search, sortBy, sortOrder,
    });
    const { data, meta } = paginate(teachers, total, page, limit);
    return res.json(successResponse(data, 'Teachers retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Students
// ═══════════════════════════════════════════════════

export async function getStudents(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit, search, sortBy, sortOrder } = getPagination(req);
    const classId = (req.query.classId as string) || undefined;
    const sectionId = (req.query.sectionId as string) || undefined;
    const { students, total } = await PrincipalService.listStudents(ctx.tenantId, {
      page, limit, search, sortBy, sortOrder, classId, sectionId,
    });
    const { data, meta } = paginate(students, total, page, limit);
    return res.json(successResponse(data, 'Students retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Parents
// ═══════════════════════════════════════════════════

export async function getParents(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit, search, sortBy, sortOrder } = getPagination(req);
    const { parents, total } = await PrincipalService.listParents(ctx.tenantId, {
      page, limit, search, sortBy, sortOrder,
    });
    const { data, meta } = paginate(parents, total, page, limit);
    return res.json(successResponse(data, 'Parents retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Admins
// ═══════════════════════════════════════════════════

export async function getAdmins(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit, search, sortBy, sortOrder } = getPagination(req);
    const { admins, total } = await PrincipalService.listAdmins(ctx.tenantId, {
      page, limit, search, sortBy, sortOrder,
    });
    const { data, meta } = paginate(admins, total, page, limit);
    return res.json(successResponse(data, 'Admins retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Announcements
// ═══════════════════════════════════════════════════

export async function createAnnouncement(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { title, content, priority, targetAudience, targetClassId, targetSectionId, expiresAt } = req.body;

    const announcement = await PrincipalService.createAnnouncement({
      tenantId: ctx.tenantId,
      postedBy: ctx.userId,
      title,
      content,
      priority,
      targetAudience,
      targetClassId,
      targetSectionId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    return res.status(201).json(successResponse(announcement, 'Announcement created'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getAnnouncements(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit, sortBy, sortOrder } = getPagination(req);
    const { announcements, total } = await PrincipalService.listAnnouncements(ctx.tenantId, ctx.userId, {
      page, limit, sortBy, sortOrder,
    });
    const { data, meta } = paginate(announcements, total, page, limit);
    return res.json(successResponse(data, 'Announcements retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function deleteAnnouncement(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { id } = req.params;
    const result = await PrincipalService.deleteAnnouncement(id, ctx.tenantId, ctx.userId);
    if (result.count === 0) {
      return res.status(404).json(errorResponse('NOT_FOUND', 'Announcement not found'));
    }
    return res.json(successResponse(null, 'Announcement deleted'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Messages
// ═══════════════════════════════════════════════════

export async function sendMessage(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { receiverId, content, messageType, attachments } = req.body;

    // Handle group message
    if (Array.isArray(receiverId)) {
      const messages = await Promise.all(
        receiverId.map((rid: string) =>
          PrincipalService.sendMessage(ctx.tenantId, ctx.userId, rid, content, messageType, attachments)
        )
      );
      return res.status(201).json(successResponse(messages, 'Group messages sent'));
    }

    const message = await PrincipalService.sendMessage(ctx.tenantId, ctx.userId, receiverId, content, messageType, attachments);
    return res.status(201).json(successResponse(message, 'Message sent'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

export async function getMessages(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { page, limit } = getPagination(req);
    const { messages, total } = await PrincipalService.getMessageThreads(ctx.userId, ctx.tenantId, { page, limit, sortBy: 'createdAt', sortOrder: 'desc' });
    const { data, meta } = paginate(messages, total, page, limit);
    return res.json(successResponse(data, 'Messages retrieved', meta));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Bulk Notifications
// ═══════════════════════════════════════════════════

export async function sendBulkNotification(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { targetRole, title, body, type, targetClassId, data } = req.body;
    const result = await PrincipalService.sendBulkNotification(
      ctx.tenantId,
      ctx.userId,
      targetRole,
      title,
      body,
      type,
      targetClassId,
      data
    );
    return res.status(201).json(successResponse(result, `${result.count} notifications sent`));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Attendance Summary
// ═══════════════════════════════════════════════════

export async function getAttendanceSummary(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const period = (req.query.period as string) || 'daily';
    const date = (req.query.date as string) || undefined;
    const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;

    const summary = await PrincipalService.getAttendanceSummary(ctx.tenantId, period, date, month, year);
    return res.json(successResponse(summary, 'Attendance summary retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Fee Summary
// ═══════════════════════════════════════════════════

export async function getFeeSummary(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
    const summary = await PrincipalService.getFeeSummary(ctx.tenantId, month, year);
    return res.json(successResponse(summary, 'Fee summary retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// Performance Overview
// ═══════════════════════════════════════════════════

export async function getPerformance(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const { classId, sectionId, term, academicYear } = req.query;
    const overview = await PrincipalService.getPerformanceOverview(
      ctx.tenantId,
      classId as string,
      sectionId as string,
      term as string,
      academicYear as string
    );
    return res.json(successResponse(overview, 'Performance overview retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}

// ═══════════════════════════════════════════════════
// School Reports
// ═══════════════════════════════════════════════════

export async function getReports(req: Request, res: Response) {
  const ctx = getTenantAndUser(req);
  if (!ctx) return res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));

  try {
    const type = (req.query.type as string) || 'enrollment';
    const from = (req.query.from as string) || undefined;
    const to = (req.query.to as string) || undefined;
    const classId = (req.query.classId as string) || undefined;

    const report = await PrincipalService.getSchoolReports(ctx.tenantId, type, from, to, classId);
    return res.json(successResponse(report, 'Report retrieved'));
  } catch (err: any) {
    return res.status(500).json(errorResponse('INTERNAL_ERROR', err.message));
  }
}
