// ═══════════════════════════════════════════════════
// Shared Audit Logging Service
// ═══════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';

export interface AuditLogData {
  tenantId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
}

// ── Create an audit log entry ──

export async function createAuditLog(
  prisma: PrismaClient,
  data: AuditLogData
) {
  return prisma.auditLog.create({
    data: {
      tenantId: data.tenantId,
      userId: data.userId || null,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      oldValues: data.oldValues ? JSON.parse(JSON.stringify(data.oldValues)) : undefined,
      newValues: data.newValues ? JSON.parse(JSON.stringify(data.newValues)) : undefined,
      ipAddress: data.ipAddress || null,
    },
  });
}

// ── Batch audit logs ──

export async function createAuditLogs(
  prisma: PrismaClient,
  entries: AuditLogData[]
) {
  return prisma.$transaction(
    entries.map((entry) =>
      prisma.auditLog.create({
        data: {
          tenantId: entry.tenantId,
          userId: entry.userId || null,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          oldValues: entry.oldValues ? JSON.parse(JSON.stringify(entry.oldValues)) : undefined,
          newValues: entry.newValues ? JSON.parse(JSON.stringify(entry.newValues)) : undefined,
          ipAddress: entry.ipAddress || null,
        },
      })
    )
  );
}

// ── Query audit logs for tenant ──

export async function getAuditLogs(
  prisma: PrismaClient,
  tenantId: string,
  options?: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    action?: string;
    page?: number;
    limit?: number;
    from?: Date;
    to?: Date;
  }
) {
  const {
    userId,
    entityType,
    entityId,
    action,
    page = 1,
    limit = 20,
    from,
    to,
  } = options || {};

  const where: Record<string, unknown> = { tenantId };
  if (userId) where.userId = userId;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (action) where.action = action;
  if (from || to) {
    where.createdAt = {};
    if (from) (where.createdAt as Record<string, Date>).gte = from;
    if (to) (where.createdAt as Record<string, Date>).lte = to;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { firstName: true, lastName: true, role: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}
