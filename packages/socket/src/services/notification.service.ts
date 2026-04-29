/**
 * Notification service for real-time notification delivery
 */

import { Server } from "socket.io";
import { NotificationPayload } from "../types/socket";
import { createNotification } from "./api.service";
import { getUserRoom, getTenantRoom, getRoleRoom, getNotificationRoom } from "./room.service";
import { sendPushToUser, sendPushToUsers } from "./push.service";
import { logger } from "../utils/logger";

export async function sendUserNotification(
  io: Server,
  userId: string,
  notification: NotificationPayload
): Promise<void> {
  try {
    // Persist notification via API
    await createNotification({
      ...notification,
      userId,
    });

    // Emit to user's notification room
    io.to(getNotificationRoom(userId)).emit("notification:receive", notification);
    io.to(getUserRoom(userId)).emit("notification:receive", notification);

    // Send push notification
    await sendPushToUser(userId, notification);

    logger.debug(`Notification sent to user ${userId}: ${notification.title}`);
  } catch (error) {
    logger.error(`Error sending notification to user ${userId}:`, error);
  }
}

export async function sendRoleNotification(
  io: Server,
  tenantId: string,
  role: string,
  notification: NotificationPayload
): Promise<void> {
  try {
    // Persist via API (optional — role notifications may not need per-user persistence)
    const room = getRoleRoom(role, tenantId);
    io.to(room).emit("notification:receive", notification);
    io.to(getTenantRoom(tenantId)).emit("notification:receive", notification);

    logger.debug(`Role notification sent to ${role} in tenant ${tenantId}: ${notification.title}`);
  } catch (error) {
    logger.error(`Error sending role notification:`, error);
  }
}

export async function sendTenantNotification(
  io: Server,
  tenantId: string,
  notification: NotificationPayload
): Promise<void> {
  try {
    const room = getTenantRoom(tenantId);
    io.to(room).emit("notification:receive", notification);

    logger.debug(`Tenant broadcast sent to ${tenantId}: ${notification.title}`);
  } catch (error) {
    logger.error(`Error sending tenant notification:`, error);
  }
}

export async function sendBulkNotifications(
  io: Server,
  userIds: string[],
  notification: NotificationPayload
): Promise<void> {
  try {
    // Emit to all user rooms
    userIds.forEach((userId) => {
      io.to(getUserRoom(userId)).emit("notification:receive", notification);
      io.to(getNotificationRoom(userId)).emit("notification:receive", notification);
    });

    // Send push notifications
    await sendPushToUsers(userIds, notification);

    logger.debug(`Bulk notification sent to ${userIds.length} users`);
  } catch (error) {
    logger.error(`Error sending bulk notifications:`, error);
  }
}
