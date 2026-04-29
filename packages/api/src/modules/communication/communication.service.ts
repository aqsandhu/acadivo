import { NotificationType, AnnouncementPriority, AnnouncementTargetAudience, MessageType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { createNotification, sendBulkNotifications } from "./notification.service";



// ──────────────────────────────────────────────
// Notification Service
// ──────────────────────────────────────────────

export async function getMyNotifications(
  userId: string,
  tenantId: string,
  filters: {
    type?: NotificationType;
    isRead?: boolean;
    page?: number;
    pageSize?: number;
  }
) {
  const { type, isRead, page = 1, pageSize = 20 } = filters;
  const where: Record<string, unknown> = { userId, tenantId };
  if (type) where.type = type;
  if (isRead !== undefined) where.isRead = isRead;

  const [notifications, totalCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } },
    }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function deleteNotification(notificationId: string, userId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!notification) throw ApiError.notFound("Notification not found");
  await prisma.notification.delete({ where: { id: notificationId } });
  return { deleted: true };
}

// ──────────────────────────────────────────────
// Announcement Service
// ──────────────────────────────────────────────

export async function getAnnouncements(
  tenantId: string,
  userRole: string,
  classId?: string,
  filters: {
    priority?: AnnouncementPriority;
    targetAudience?: AnnouncementTargetAudience;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  } = {}
) {
  const { priority, targetAudience, fromDate, toDate, page = 1, pageSize = 20 } = filters;

  const where: Record<string, unknown> = { tenantId };

  // Role-based audience filtering
  const audienceMap: Record<string, AnnouncementTargetAudience[]> = {
    SUPER_ADMIN: ["ALL", "ADMIN"],
    PRINCIPAL: ["ALL", "ADMIN", "TEACHERS"],
    ADMIN: ["ALL", "ADMIN"],
    TEACHER: ["ALL", "TEACHERS"],
    STUDENT: ["ALL", "STUDENTS"],
    PARENT: ["ALL", "PARENTS"],
  };

  const allowedAudiences = audienceMap[userRole] || ["ALL"];
  if (targetAudience && allowedAudiences.includes(targetAudience)) {
    where.targetAudience = targetAudience;
  } else {
    where.targetAudience = { in: allowedAudiences };
  }

  if (classId) {
    where.OR = [
      { targetClassId: classId },
      { targetClassId: null },
    ];
  }

  if (priority) where.priority = priority;
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) (where.createdAt as Record<string, Date>).gte = new Date(fromDate);
    if (toDate) (where.createdAt as Record<string, Date>).lte = new Date(toDate);
  }

  // Exclude expired
  where.OR = [
    { expiresAt: null },
    { expiresAt: { gt: new Date() } },
  ];

  const [announcements, totalCount] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        postedByUser: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
        targetClass: { select: { id: true, name: true } },
      },
    }),
    prisma.announcement.count({ where }),
  ]);

  return { announcements, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function getAnnouncementById(id: string, tenantId: string) {
  const announcement = await prisma.announcement.findFirst({
    where: { id, tenantId },
    include: {
      postedByUser: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
      targetClass: { select: { id: true, name: true } },
    },
  });
  if (!announcement) throw ApiError.notFound("Announcement not found");
  return announcement;
}

export async function createAnnouncement(
  tenantId: string,
  postedBy: string,
  data: {
    title: string;
    content: string;
    attachments?: Record<string, unknown>[];
    priority?: AnnouncementPriority;
    targetAudience?: AnnouncementTargetAudience;
    targetClassId?: string;
    targetSectionId?: string;
    expiresAt?: string;
  }
) {
  const announcement = await prisma.announcement.create({
    data: {
      tenantId,
      postedBy,
      title: data.title,
      content: data.content,
      attachments: data.attachments,
      priority: data.priority || "NORMAL",
      targetAudience: data.targetAudience || "ALL",
      targetClassId: data.targetClassId,
      targetSectionId: data.targetSectionId,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
    include: {
      postedByUser: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  // Notify targeted users
  const targetUsers = await resolveTargetUsers(tenantId, data.targetAudience || "ALL", data.targetClassId);
  if (targetUsers.length > 0) {
    await sendBulkNotifications({
      tenantId,
      userIds: targetUsers.map((u) => u.id),
      title: `Announcement: ${data.title}`,
      body: data.content.substring(0, 200),
      type: "ANNOUNCEMENT",
      senderId: postedBy,
      data: { announcementId: announcement.id },
    });
  }

  return announcement;
}

export async function updateAnnouncement(
  id: string,
  tenantId: string,
  data: Partial<{
    title: string;
    content: string;
    attachments: Record<string, unknown>[];
    priority: AnnouncementPriority;
    targetAudience: AnnouncementTargetAudience;
    targetClassId: string;
    targetSectionId: string;
    expiresAt: string;
  }>
) {
  const announcement = await prisma.announcement.findFirst({ where: { id, tenantId } });
  if (!announcement) throw ApiError.notFound("Announcement not found");

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.attachments !== undefined) updateData.attachments = data.attachments;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.targetAudience !== undefined) updateData.targetAudience = data.targetAudience;
  if (data.targetClassId !== undefined) updateData.targetClassId = data.targetClassId || null;
  if (data.targetSectionId !== undefined) updateData.targetSectionId = data.targetSectionId || null;
  if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

  return prisma.announcement.update({
    where: { id },
    data: updateData,
    include: {
      postedByUser: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function pinAnnouncement(id: string, tenantId: string, isPinned: boolean) {
  const announcement = await prisma.announcement.findFirst({ where: { id, tenantId } });
  if (!announcement) throw ApiError.notFound("Announcement not found");

  return prisma.announcement.update({
    where: { id },
    data: { isPinned },
  });
}

export async function deleteAnnouncement(id: string, tenantId: string) {
  const announcement = await prisma.announcement.findFirst({ where: { id, tenantId } });
  if (!announcement) throw ApiError.notFound("Announcement not found");

  await prisma.announcement.delete({ where: { id } });
  return { deleted: true };
}

export async function getSchoolAnnouncements(schoolId: string, page = 1, pageSize = 20) {
  const [announcements, totalCount] = await Promise.all([
    prisma.announcement.findMany({
      where: { tenantId: schoolId },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        postedByUser: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    }),
    prisma.announcement.count({ where: { tenantId: schoolId } }),
  ]);

  return { announcements, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

async function resolveTargetUsers(
  tenantId: string,
  targetAudience: AnnouncementTargetAudience,
  targetClassId?: string
): Promise<{ id: string }[]> {
  const roleMap: Record<string, string> = {
    TEACHERS: "TEACHER",
    STUDENTS: "STUDENT",
    PARENTS: "PARENT",
    ADMIN: "ADMIN",
    ALL: "",
  };

  if (targetAudience === "ALL") {
    return prisma.user.findMany({
      where: { tenantId, isActive: true },
      select: { id: true },
    });
  }

  const where: Record<string, unknown> = { tenantId, isActive: true };
  if (roleMap[targetAudience]) {
    where.role = roleMap[targetAudience];
  }
  if (targetClassId && targetAudience === "CLASS") {
    // Find students of that class
    const students = await prisma.student.findMany({
      where: { tenantId, classId: targetClassId },
      select: { userId: true },
    });
    return students.map((s) => ({ id: s.userId }));
  }

  return prisma.user.findMany({ where, select: { id: true } });
}

// ──────────────────────────────────────────────
// Message (Chat) Service
// ──────────────────────────────────────────────

export async function getConversations(userId: string, tenantId: string) {
  const sent = prisma.message.groupBy({
    by: ["receiverId"],
    where: { senderId: userId, tenantId },
    _max: { createdAt: true },
  });

  const received = prisma.message.groupBy({
    by: ["senderId"],
    where: { receiverId: userId, tenantId },
    _max: { createdAt: true },
  });

  const [sentGroups, receivedGroups] = await Promise.all([sent, received]);

  const partnerMap = new Map<string, Date>();
  for (const g of sentGroups) {
    const date = g._max.createdAt!;
    const current = partnerMap.get(g.receiverId);
    if (!current || date > current) partnerMap.set(g.receiverId, date);
  }
  for (const g of receivedGroups) {
    const date = g._max.createdAt!;
    const current = partnerMap.get(g.senderId);
    if (!current || date > current) partnerMap.set(g.senderId, date);
  }

  const partnerIds = Array.from(partnerMap.keys());
  if (partnerIds.length === 0) return { conversations: [] };

  const users = await prisma.user.findMany({
    where: { id: { in: partnerIds }, tenantId },
    select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
  });

  const lastMessages = await Promise.all(
    partnerIds.map(async (pid) => {
      const msg = await prisma.message.findFirst({
        where: {
          tenantId,
          OR: [
            { senderId: userId, receiverId: pid },
            { senderId: pid, receiverId: userId },
          ],
        },
        orderBy: { createdAt: "desc" },
        select: { content: true, createdAt: true, isRead: true, senderId: true },
      });
      return { partnerId: pid, lastMessage: msg };
    })
  );

  const conversations = users.map((u) => {
    const lm = lastMessages.find((lm) => lm.partnerId === u.id)?.lastMessage;
    return {
      user: u,
      lastMessage: lm,
      unreadCount: 0, // computed below
    };
  });

  // Compute unread counts
  for (const conv of conversations) {
    conv.unreadCount = await prisma.message.count({
      where: {
        tenantId,
        senderId: conv.user.id,
        receiverId: userId,
        isRead: false,
      },
    });
  }

  return { conversations };
}

export async function getMessagesWithUser(
  userId: string,
  otherUserId: string,
  tenantId: string,
  page = 1,
  pageSize = 50
) {
  const [messages, totalCount] = await Promise.all([
    prisma.message.findMany({
      where: {
        tenantId,
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        replyTo: { select: { id: true, content: true, senderId: true } },
      },
    }),
    prisma.message.count({
      where: {
        tenantId,
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
    }),
  ]);

  return { messages, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function sendMessage(
  tenantId: string,
  senderId: string,
  data: {
    receiverId: string;
    content: string;
    attachments?: Record<string, unknown>[];
    messageType?: MessageType;
    replyToId?: string;
  }
) {
  const message = await prisma.message.create({
    data: {
      tenantId,
      senderId,
      receiverId: data.receiverId,
      content: data.content,
      attachments: data.attachments,
      messageType: data.messageType || "TEXT",
      replyToId: data.replyToId || null,
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      receiver: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
  });

  // Notify receiver
  await createNotification({
    tenantId,
    userId: data.receiverId,
    title: "New Message",
    body: `${message.sender.firstName} ${message.sender.lastName}: ${data.content.substring(0, 100)}`,
    type: "MESSAGE",
    senderId,
    data: { messageId: message.id },
  });

  return message;
}

export async function sendGroupMessage(
  tenantId: string,
  senderId: string,
  data: {
    receiverIds: string[];
    content: string;
    attachments?: Record<string, unknown>[];
    messageType?: MessageType;
  }
) {
  const messages = await prisma.$transaction(
    data.receiverIds.map((receiverId) =>
      prisma.message.create({
        data: {
          tenantId,
          senderId,
          receiverId,
          content: data.content,
          attachments: data.attachments,
          messageType: data.messageType || "TEXT",
        },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          receiver: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
      })
    )
  );

  // Bulk notify receivers
  const sender = messages[0]?.sender;
  if (sender) {
    await sendBulkNotifications({
      tenantId,
      userIds: data.receiverIds,
      title: "New Group Message",
      body: `${sender.firstName} ${sender.lastName}: ${data.content.substring(0, 100)}`,
      type: "MESSAGE",
      senderId,
      data: { groupMessage: true },
    });
  }

  return { messages, count: messages.length };
}

export async function markMessageAsRead(messageId: string, userId: string, tenantId: string) {
  const message = await prisma.message.findFirst({
    where: { id: messageId, receiverId: userId, tenantId },
  });
  if (!message) throw ApiError.notFound("Message not found");

  return prisma.message.update({
    where: { id: messageId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function softDeleteMessage(messageId: string, userId: string, tenantId: string) {
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      tenantId,
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
  });
  if (!message) throw ApiError.notFound("Message not found");

  // Soft delete by clearing content
  return prisma.message.update({
    where: { id: messageId },
    data: { content: "[deleted]", attachments: [] },
  });
}

export async function getUnreadMessageCount(userId: string, tenantId: string) {
  const count = await prisma.message.count({
    where: { receiverId: userId, tenantId, isRead: false },
  });
  return { count };
}
