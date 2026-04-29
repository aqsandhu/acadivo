// ═══════════════════════════════════════════════════
// Shared Notification Service
// ═══════════════════════════════════════════════════

import { PrismaClient, NotificationType } from '@prisma/client';

export interface CreateNotificationData {
  tenantId: string;
  userId: string;       // recipient
  title: string;
  body: string;
  type: NotificationType;
  senderId?: string;    // sender (null for system)
  data?: Record<string, unknown>; // metadata
}

export interface BulkNotificationData {
  tenantId: string;
  userIds: string[];
  title: string;
  body: string;
  type: NotificationType;
  senderId?: string;
  data?: Record<string, unknown>;
}

// ── Create a single notification ──

export async function createNotification(
  prisma: PrismaClient,
  data: CreateNotificationData
) {
  const notification = await prisma.notification.create({
    data: {
      tenantId: data.tenantId,
      userId: data.userId,
      title: data.title,
      body: data.body,
      type: data.type,
      senderId: data.senderId || null,
      data: data.data ? JSON.parse(JSON.stringify(data.data)) : undefined,
    },
  });

  // TODO: Trigger push notification (Firebase, OneSignal, etc.)
  // await pushService.send({ ... });

  return notification;
}

// ── Create bulk notifications ──

export async function createBulkNotifications(
  prisma: PrismaClient,
  data: BulkNotificationData
) {
  const notifications = await prisma.$transaction(
    data.userIds.map((userId) =>
      prisma.notification.create({
        data: {
          tenantId: data.tenantId,
          userId,
          title: data.title,
          body: data.body,
          type: data.type,
          senderId: data.senderId || null,
          data: data.data ? JSON.parse(JSON.stringify(data.data)) : undefined,
        },
      })
    )
  );

  // TODO: Batch push
  return notifications;
}

// ── Get user's notifications ──

export async function getUserNotifications(
  prisma: PrismaClient,
  userId: string,
  tenantId: string,
  options?: { page?: number; limit?: number; unreadOnly?: boolean }
) {
  const { page = 1, limit = 20, unreadOnly = false } = options || {};

  const where = {
    userId,
    tenantId,
    ...(unreadOnly ? { isRead: false } : {}),
  };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, total };
}

// ── Mark as read ──

export async function markNotificationRead(
  prisma: PrismaClient,
  notificationId: string,
  userId: string
) {
  return prisma.notification.update({
    where: { id: notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  });
}

// ── Mark all as read ──

export async function markAllNotificationsRead(
  prisma: PrismaClient,
  userId: string,
  tenantId: string
) {
  return prisma.notification.updateMany({
    where: { userId, tenantId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

// ── Send notification to role group ──

export async function notifyRoleGroup(
  prisma: PrismaClient,
  tenantId: string,
  role: 'TEACHER' | 'STUDENT' | 'PARENT' | 'ADMIN' | 'PRINCIPAL',
  title: string,
  body: string,
  type: NotificationType,
  senderId?: string,
  data?: Record<string, unknown>
) {
  const users = await prisma.user.findMany({
    where: { tenantId, role, isActive: true },
    select: { id: true },
  });

  if (users.length === 0) return [];

  return createBulkNotifications(prisma, {
    tenantId,
    userIds: users.map((u) => u.id),
    title,
    body,
    type,
    senderId,
    data,
  });
}
