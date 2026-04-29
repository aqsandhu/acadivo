import { NotificationType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";



// ──────────────────────────────────────────────
// Notification Helper Service
// ──────────────────────────────────────────────

export interface CreateNotificationInput {
  tenantId: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  senderId?: string;
  data?: Record<string, unknown>;
}

export interface BulkNotificationInput {
  tenantId: string;
  userIds: string[];
  title: string;
  body: string;
  type: NotificationType;
  senderId?: string;
  data?: Record<string, unknown>;
}

/**
 * Create a single notification record + trigger push (async)
 */
export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      senderId: input.senderId,
      data: input.data,
    },
  });

  // Fire-and-forget push notification
  sendPushNotification(input.userId, input.title, input.body, input.data).catch(() => {
    // Silently log push failures
  });

  return notification;
}

/**
 * Bulk create notifications for multiple users
 */
export async function sendBulkNotifications(input: BulkNotificationInput) {
  const data = input.userIds.map((userId) => ({
    tenantId: input.tenantId,
    userId,
    title: input.title,
    body: input.body,
    type: input.type,
    senderId: input.senderId,
    data: input.data,
  }));

  const result = await prisma.notification.createMany({
    data,
    skipDuplicates: false,
  });

  // Fire-and-forget push notifications (batched)
  for (const userId of input.userIds) {
    sendPushNotification(userId, input.title, input.body, input.data).catch(() => {
      // Silently log push failures
    });
  }

  return result;
}

/**
 * Send FCM push notification (stub — wire up with firebase-admin)
 */
export async function sendPushNotification(
  _userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<boolean> {
  // TODO: Integrate firebase-admin to get device tokens from Redis/DB
  // const tokens = await getUserDeviceTokens(userId);
  // if (!tokens.length) return false;
  // await admin.messaging().sendMulticast({
  //   tokens,
  //   notification: { title, body },
  //   data: data as Record<string, string>,
  // });

  console.log(`[PUSH] ToUser:${_userId} | Title:${title} | Body:${body} | Data:${JSON.stringify(data)}`);
  return true;
}

/**
 * Send SMS notification via Pakistan telecom APIs (stub)
 */
export async function sendSMS(
  phone: string,
  message: string
): Promise<boolean> {
  // TODO: Integrate with Twilio / local Pakistan SMS gateway
  // Example: Send via Twilio
  // await twilioClient.messages.create({ body: message, from: TWILIO_FROM, to: phone });

  console.log(`[SMS] To:${phone} | Message:${message}`);
  return true;
}

/**
 * Send email notification (stub — wire up with nodemailer / SendGrid)
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  _text?: string
): Promise<boolean> {
  // TODO: Integrate with Nodemailer / SendGrid
  // Example:
  // await transporter.sendMail({ from: SMTP_FROM, to, subject, html, text });

  console.log(`[EMAIL] To:${to} | Subject:${subject}`);
  return true;
}

/**
 * Get unread notification count for user
 */
export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return count;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!notification) {
    throw ApiError.notFound("Notification not found");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  });
}

/**
 * Mark all notifications as read for user
 */
export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}
