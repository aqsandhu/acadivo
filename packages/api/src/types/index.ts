// ═══════════════════════════════════════════════════
// Shared Types for Acadivo API
// ═══════════════════════════════════════════════════

import { UserRole, SettingCategory } from '@prisma/client';

// ── Request Context (injected by auth middleware) ──

export interface AuthRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    role: UserRole;
    email: string;
  };
}

// ── Pagination Query Params ──

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ── Common Filters ──

export interface DateRangeFilter {
  from?: string; // ISO date string
  to?: string; // ISO date string
}

// ── Dashboard Stats ──

export interface DashboardStats {
  teacherCount: number;
  studentCount: number;
  parentCount: number;
  adminCount: number;
  attendanceToday: { present: number; absent: number; late: number; total: number };
  feeCollectionThisMonth: number;
  pendingReports: number;
  unreadMessages: number;
}

// ── Bulk Import ──

export type BulkImportEntityType = 'STUDENT' | 'TEACHER' | 'PARENT';

export interface BulkImportRow {
  [key: string]: string | number | undefined;
}

// ── Notification Payload ──

export interface NotificationPayload {
  title: string;
  body: string;
  type: string;
  data?: Record<string, unknown>;
}

// ── Audit Log Entry ──

export interface AuditLogEntry {
  tenantId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
}

// ── ID Prefixes ──

export const ID_PREFIXES: Record<Exclude<UserRole, 'SUPER_ADMIN'>, string> = {
  PRINCIPAL: 'PRC',
  ADMIN: 'ADM',
  TEACHER: 'TCH',
  STUDENT: 'STD',
  PARENT: 'PAR',
};
