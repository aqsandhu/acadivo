/**
 * Firebase Cloud Messaging (FCM) push notification service
 * Handles device token management, push delivery, and token cleanup
 */

import admin from "firebase-admin";
import { env } from "../config/env";
import { NotificationPayload } from "../types/socket";
import { getDeviceTokens, getDeviceTokensBulk, removeDeviceToken } from "./api.service";
import { redisClient } from "../config/redis";
import { logger } from "../utils/logger";

let firebaseInitialized = false;

function initializeFirebase(): void {
  if (firebaseInitialized) return;
  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_PRIVATE_KEY || !env.FIREBASE_CLIENT_EMAIL) {
    logger.warn("Firebase credentials not configured. Push notifications will be disabled.");
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        privateKey: env.FIREBASE_PRIVATE_KEY,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    firebaseInitialized = true;
    logger.info("Firebase Admin SDK initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize Firebase Admin SDK:", error);
  }
}

initializeFirebase();

const FCM_TOKEN_KEY = (userId: string) => `fcm:tokens:${userId}`;

/**
 * Register an FCM token for a user (with Redis caching)
 */
export async function registerFcmToken(userId: string, token: string, deviceInfo?: string): Promise<void> {
  try {
    await redisClient.hset(FCM_TOKEN_KEY(userId), token, JSON.stringify({
      deviceInfo: deviceInfo || "unknown",
      registeredAt: new Date().toISOString(),
    }));
    await redisClient.expire(FCM_TOKEN_KEY(userId), 60 * 60 * 24 * 30); // 30 days
    logger.info(`FCM token registered for user ${userId}`);
  } catch (error) {
    logger.error(`Error registering FCM token for user ${userId}:`, error);
  }
}

/**
 * Unregister an FCM token for a user
 */
export async function unregisterFcmToken(userId: string, token: string): Promise<void> {
  try {
    await redisClient.hdel(FCM_TOKEN_KEY(userId), token);
    logger.info(`FCM token unregistered for user ${userId}`);
  } catch (error) {
    logger.error(`Error unregistering FCM token for user ${userId}:`, error);
  }
}

/**
 * Cleanup invalid FCM tokens from Redis and API
 */
export async function cleanupInvalidTokens(userId: string, invalidTokens: string[]): Promise<void> {
  try {
    const pipeline = redisClient.pipeline();
    for (const token of invalidTokens) {
      pipeline.hdel(FCM_TOKEN_KEY(userId), token);
    }
    await pipeline.exec();

    // Also remove from API database
    for (const token of invalidTokens) {
      await removeDeviceToken(userId, token);
    }
    logger.info(`Cleaned up ${invalidTokens.length} invalid FCM tokens for user ${userId}`);
  } catch (error) {
    logger.error(`Error cleaning up FCM tokens for user ${userId}:`, error);
  }
}

export async function sendPushToUser(
  userId: string,
  notification: NotificationPayload
): Promise<void> {
  if (!firebaseInitialized) {
    logger.debug("Firebase not initialized. Skipping push.");
    return;
  }

  try {
    const tokens = await getDeviceTokens(userId);
    if (!tokens.length) {
      logger.debug(`No device tokens found for user ${userId}`);
      return;
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...notification.data,
        type: notification.type,
        notificationId: notification.id,
        senderId: notification.senderId || "",
        tenantId: notification.tenantId || "",
      },
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    logger.info(
      `Push sent to user ${userId}: ${response.successCount} succeeded, ${response.failureCount} failed`
    );

    // Handle invalid tokens
    const invalidTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const error = resp.error;
        if (
          error?.code === "messaging/invalid-registration-token" ||
          error?.code === "messaging/registration-token-not-registered"
        ) {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      await cleanupInvalidTokens(userId, invalidTokens);
    }
  } catch (error) {
    logger.error(`Error sending push to user ${userId}:`, error);
  }
}

export async function sendPushToUsers(
  userIds: string[],
  notification: NotificationPayload
): Promise<void> {
  if (!firebaseInitialized) {
    logger.debug("Firebase not initialized. Skipping bulk push.");
    return;
  }

  try {
    const tokensMap = await getDeviceTokensBulk(userIds);
    const allTokens: string[] = [];

    Object.values(tokensMap).forEach((tokens) => {
      allTokens.push(...tokens);
    });

    if (!allTokens.length) {
      logger.debug("No device tokens found for bulk push");
      return;
    }

    // FCM multicast limit is 500 tokens per call
    const batchSize = 500;
    for (let i = 0; i < allTokens.length; i += batchSize) {
      const batch = allTokens.slice(i, i + batchSize);
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          ...notification.data,
          type: notification.type,
          notificationId: notification.id,
          senderId: notification.senderId || "",
          tenantId: notification.tenantId || "",
        },
        tokens: batch,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      logger.info(
        `Bulk push batch ${i / batchSize + 1}: ${response.successCount} succeeded, ${response.failureCount} failed`
      );
    }
  } catch (error) {
    logger.error("Error sending bulk push notifications:", error);
  }
}

export async function sendPushToTopic(
  topic: string,
  notification: NotificationPayload
): Promise<void> {
  if (!firebaseInitialized) {
    logger.debug("Firebase not initialized. Skipping topic push.");
    return;
  }

  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        ...notification.data,
        type: notification.type,
        notificationId: notification.id,
      },
      topic,
    };

    const response = await admin.messaging().send(message);
    logger.info(`Topic push sent to ${topic}: ${response}`);
  } catch (error) {
    logger.error(`Error sending push to topic ${topic}:`, error);
  }
}
