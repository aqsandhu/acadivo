import { NotificationType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";

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

export interface ScheduledNotificationInput extends CreateNotificationInput {
  scheduledAt: Date;
}

// ── FCM Push Notification Stub ──

let fcmInitialized = false;

/**
 * Initialize FCM with service account credentials.
 * Call once at app startup if FIREBASE_SERVICE_ACCOUNT is provided.
 */
export async function initializeFCM(): Promise<boolean> {
  try {
    const firebaseAdmin = await import("firebase-admin");
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccountJson) {
      logger.warn("FCM: FIREBASE_SERVICE_ACCOUNT not configured, push notifications disabled");
      return false;
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(serviceAccount),
    });

    fcmInitialized = true;
    logger.info("FCM: Push notifications initialized");
    return true;
  } catch (err: any) {
    logger.error(`FCM: Initialization failed: ${err.message}`);
    return false;
  }
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
 * Batch send notifications with chunked processing to avoid DB overload.
 * Processes userIds in chunks of 100.
 */
export async function sendBatchNotifications(
  input: BulkNotificationInput,
  chunkSize = 100
) {
  const { userIds, ...baseInput } = input;
  const chunks: string[][] = [];

  for (let i = 0; i < userIds.length; i += chunkSize) {
    chunks.push(userIds.slice(i, i + chunkSize));
  }

  let totalCreated = 0;
  const errors: { chunk: number; error: string }[] = [];

  for (let i = 0; i < chunks.length; i++) {
    try {
      const result = await sendBulkNotifications({ ...baseInput, userIds: chunks[i] });
      totalCreated += result.count;
    } catch (err: any) {
      errors.push({ chunk: i + 1, error: err.message });
      logger.error(`Batch notification chunk ${i + 1} failed: ${err.message}`);
    }
  }

  return { totalCreated, chunksProcessed: chunks.length, errors };
}

/**
 * Schedule a notification to be sent at a future time.
 * Stores in DB with a scheduledAt flag; a cron job processes pending scheduled notifications.
 */
export async function scheduleNotification(input: ScheduledNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      title: input.title,
      body: input.body,
      type: input.type,
      senderId: input.senderId,
      data: { ...input.data, scheduledAt: input.scheduledAt.toISOString(), _scheduled: true },
    },
  });

  logger.info(`Notification scheduled for ${input.scheduledAt.toISOString()}: ${notification.id}`);
  return notification;
}

/**
 * Process pending scheduled notifications.
 * Called by a cron job every minute.
 */
export async function processScheduledNotifications() {
  const now = new Date();
  const pendingNotifications = await prisma.notification.findMany({
    where: {
      isRead: false,
      data: { path: ["_scheduled"], equals: true },
      createdAt: { lte: now },
    },
    take: 100,
  });

  for (const n of pendingNotifications) {
    try {
      // Fire push notification
      await sendPushNotification(n.userId, n.title, n.body, n.data as Record<string, unknown>);

      // Mark as delivered by removing the scheduled flag
      await prisma.notification.update({
        where: { id: n.id },
        data: { data: { ...(n.data as any), _scheduled: false, _deliveredAt: now.toISOString() } },
      });
    } catch (err: any) {
      logger.error(`Failed to process scheduled notification ${n.id}: ${err.message}`);
    }
  }

  return pendingNotifications.length;
}

/**
 * Send FCM push notification
 */
export async function sendPushNotification(
  _userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<boolean> {
  if (fcmInitialized) {
    try {
      // Get device tokens for user from DB or cache
      const tokens = await getUserDeviceTokens(_userId);
      if (!tokens.length) {
        logger.debug(`No device tokens for user ${_userId}`);
        return false;
      }

      const firebaseAdmin = await import("firebase-admin");
      const message = {
        notification: { title, body },
        data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : {},
        tokens,
      };

      const response = await firebaseAdmin.messaging().sendEachForMulticast(message);
      logger.info(`FCM: Sent to ${_userId}, success=${response.successCount}, failure=${response.failureCount}`);
      return response.successCount > 0;
    } catch (err: any) {
      logger.error(`FCM push failed for ${_userId}: ${err.message}`);
      return false;
    }
  }

  // Fallback: log the push for debugging
  console.log(`[PUSH] ToUser:${_userId} | Title:${title} | Body:${body} | Data:${JSON.stringify(data)}`);
  return true;
}

/**
 * Get FCM device tokens for a user.
 */
async function getUserDeviceTokens(userId: string): Promise<string[]> {
  // TODO: Store device tokens in a DeviceToken table or Redis
  // For now, return empty array
  return [];
}

/**
 * Register a device token for push notifications.
 */
export async function registerDeviceToken(userId: string, token: string, platform?: string): Promise<void> {
  // TODO: Store in a DeviceToken model
  logger.info(`Device token registered for user ${userId} (${platform}): ${token.slice(0, 10)}...`);
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
