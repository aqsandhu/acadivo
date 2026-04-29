// ═══════════════════════════════════════════════════
// Principal Validator — Request Validation Schemas
// ═══════════════════════════════════════════════════

import { z } from 'zod';

// ── Dashboard ──
export const dashboardQuerySchema = z.object({
  date: z.string().optional(), // YYYY-MM-DD
});

// ── List Users (teachers/students/parents/admins) ──
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ── Create Announcement ──
export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  targetAudience: z.enum(['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'ADMIN', 'CLASS']).default('ALL'),
  targetClassId: z.string().optional(),
  targetSectionId: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

// ── Send Message ──
export const sendMessageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1).max(2000),
  messageType: z.enum(['TEXT', 'IMAGE', 'FILE', 'VOICE']).default('TEXT'),
  attachments: z.array(z.object({ url: z.string(), name: z.string(), type: z.string() })).optional(),
});

export const sendGroupMessageSchema = z.object({
  receiverIds: z.array(z.string().min(1)).min(1),
  content: z.string().min(1).max(2000),
  messageType: z.enum(['TEXT', 'IMAGE', 'FILE', 'VOICE']).default('TEXT'),
  attachments: z.array(z.object({ url: z.string(), name: z.string(), type: z.string() })).optional(),
});

// ── Send Bulk Notification ──
export const sendBulkNotificationSchema = z.object({
  targetRole: z.enum(['ALL', 'TEACHERS', 'STUDENTS', 'PARENTS', 'ADMIN']).default('ALL'),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  type: z.enum([
    'ANNOUNCEMENT',
    'MESSAGE',
    'REPORT_READY',
    'FEE_DUE',
    'ATTENDANCE_ALERT',
    'HOMEWORK',
    'RESULT',
    'TIMETABLE_CHANGE',
    'ADVERTISEMENT',
  ]).default('ANNOUNCEMENT'),
  targetClassId: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

// ── Attendance Summary ──
export const attendanceSummaryQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  date: z.string().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

// ── Fee Summary ──
export const feeSummaryQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

// ── Performance Query ──
export const performanceQuerySchema = z.object({
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  term: z.enum(['FIRST', 'SECOND', 'THIRD', 'FINAL']).optional(),
  academicYear: z.string().optional(),
});

// ── Reports Query ──
export const reportsQuerySchema = z.object({
  type: z.enum(['enrollment', 'attendance', 'performance', 'fee']).default('enrollment'),
  from: z.string().optional(),
  to: z.string().optional(),
  classId: z.string().optional(),
});
