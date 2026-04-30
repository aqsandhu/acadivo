/**
 * @file src/services/push.service.ts
 * @description FCM Push Notification service using firebase-admin.
 */

import admin from "firebase-admin";
import { prisma } from "../config/database";
import { redis } from "../config/redis";
import { logger } from "../utils/logger";

let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK if credentials are available.
 */
function initFirebase() {
  if (firebaseInitialized) return;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    logger.warn("[Push] Firebase credentials not configured. Push notifications disabled.");
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey,
      clientEmail,
    }),
  });

  firebaseInitialized = true;
  logger.info("[Push] Firebase Admin initialized successfully");
}

/**
 * Register or update a user's FCM token.
 */
export async function registerFCMToken(userId: string, token: string, deviceType?: string) {
  initFirebase();

  // Store in Redis for quick lookup (primary storage for FCM tokens)
  await redis.setex(`fcm:${userId}`, 30 * 24 * 60 * 60, JSON.stringify({ token, deviceType, registeredAt: new Date().toISOString() }));

  logger.info(`[Push] FCM token registered for user ${userId}`);
  return { message: "Token registered successfully" };
}

/**
 * Send a push notification to a specific user.
 */
export async function sendPushNotification(userId: string, payload: {
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  initFirebase();

  if (!firebaseInitialized) {
    logger.warn("[Push] Firebase not initialized. Skipping notification.");
    return { sent: false, reason: "Firebase not configured" };
  }

  const tokenData = await redis.get(`fcm:${userId}`);
  if (!tokenData) {
    logger.warn(`[Push] No FCM token found for user ${userId}`);
    return { sent: false, reason: "No token" };
  }

  let fcmToken: string;
  try {
    const parsed = JSON.parse(tokenData);
    fcmToken = parsed.token;
  } catch {
    fcmToken = tokenData;
  }

  try {
    const response = await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      android: {
        priority: "high",
        notification: {
          channelId: "acadivo_default",
          sound: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    });

    logger.info(`[Push] Notification sent to user ${userId}: ${response}`);
    return { sent: true, messageId: response };
  } catch (err: any) {
    // Handle invalid token
    if (err.code === "messaging/registration-token-not-registered" || err.code === "messaging/invalid-registration-token") {
      await redis.del(`fcm:${userId}`);
      logger.info(`[Push] Removed stale token for user ${userId}`);
    }
    logger.error(`[Push] Failed to send notification to user ${userId}: ${err.message}`);
    return { sent: false, reason: err.message };
  }
}

/**
 * Clean up stale FCM tokens.
 */
export async function cleanupStaleTokens(userIds?: string[]) {
  if (userIds && userIds.length > 0) {
    for (const userId of userIds) {
      await redis.del(`fcm:${userId}`);
    }
    logger.info(`[Push] Cleaned up ${userIds.length} tokens`);
  }
}
