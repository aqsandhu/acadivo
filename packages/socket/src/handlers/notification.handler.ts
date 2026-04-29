/**
 * Notification handler for notification-related Socket.io events
 */

import { Socket } from "socket.io";
import { AuthenticatedSocket } from "../types/socket";
import { joinNotificationRoom, leaveAllRooms } from "../services/room.service";
import { getUnreadNotifications, markNotificationsRead } from "../services/api.service";
import { logger } from "../utils/logger";

export function registerNotificationHandlers(socket: Socket): void {
  const authSocket = socket as AuthenticatedSocket;

  // Subscribe to notifications (re-join notification room)
  socket.on("notification:subscribe", async (data, callback) => {
    try {
      joinNotificationRoom(authSocket, authSocket.user.userId);
      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (error) {
      logger.error("notification:subscribe handler error:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: "Failed to subscribe" });
      }
    }
  });

  // Mark notifications as read
  socket.on("notification:mark-read", async (data, callback) => {
    try {
      const { notificationIds } = data || {};
      if (!notificationIds?.length) {
        socket.emit("error", {
          code: "INVALID_PAYLOAD",
          message: "notificationIds array is required",
        });
        if (typeof callback === "function") {
          callback({ success: false, error: "notificationIds required" });
        }
        return;
      }

      const success = await markNotificationsRead(notificationIds, authSocket.user.userId);
      if (typeof callback === "function") {
        callback({ success });
      }
    } catch (error) {
      logger.error("notification:mark-read handler error:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: "Failed to mark notifications as read" });
      }
    }
  });

  // Get unread notifications count
  socket.on("notification:get-unread", async (data, callback) => {
    try {
      const result = await getUnreadNotifications(authSocket.user.userId);
      socket.emit("notification:unread", result);
      if (typeof callback === "function") {
        callback({ success: true, ...result });
      }
    } catch (error) {
      logger.error("notification:get-unread handler error:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: "Failed to get unread count" });
      }
    }
  });

  logger.debug(`Notification handlers registered for socket ${socket.id}`);
}
