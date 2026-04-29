/**
 * Presence event handlers
 * Handles presence:status request and state recovery
 */

import { Server, Socket } from "socket.io";
import { AuthenticatedSocket } from "../types/socket";
import {
  getOnlineUsers,
  isUserOnline,
  getUserPresence,
  getUserDeviceCount,
} from "../services/presence.service";
import { createEventRateLimit } from "../middleware/rateLimit";
import { logger } from "../utils/logger";

const checkRateLimit = createEventRateLimit();

export function registerPresenceHandlers(io: Server, socket: Socket): void {
  const authSocket = socket as AuthenticatedSocket;
  const { userId, tenantId } = authSocket.user;

  // Request presence status of specific users
  socket.on("presence:status", async (data, callback) => {
    if (!(await checkRateLimit(socket, "presence:status"))) {
      if (typeof callback === "function") callback({ success: false, error: "Rate limited" });
      return;
    }

    try {
      const { targetUserIds } = data || {};
      if (!targetUserIds || !Array.isArray(targetUserIds)) {
        socket.emit("error", { code: "INVALID_INPUT", message: "targetUserIds array is required" });
        if (typeof callback === "function") callback({ success: false, error: "Invalid input" });
        return;
      }

      const statuses = await Promise.all(
        targetUserIds.map(async (targetId: string) => {
          const presence = await getUserPresence(targetId);
          const deviceCount = await getUserDeviceCount(targetId);
          return {
            userId: targetId,
            status: presence?.status || "offline",
            lastSeen: presence?.lastSeen || null,
            deviceCount,
          };
        })
      );

      socket.emit("presence:status:response", {
        success: true,
        data: statuses,
      });

      if (typeof callback === "function") callback({ success: true, data: statuses });
    } catch (error) {
      logger.error("presence:status handler error:", error);
      if (typeof callback === "function") callback({ success: false, error: "Failed to get presence status" });
    }
  });

  // Get all online users for tenant
  socket.on("presence:online", async (data, callback) => {
    try {
      const onlineUsers = await getOnlineUsers(tenantId);
      socket.emit("presence:online:response", {
        success: true,
        data: onlineUsers,
      });
      if (typeof callback === "function") callback({ success: true, data: onlineUsers });
    } catch (error) {
      logger.error("presence:online handler error:", error);
      if (typeof callback === "function") callback({ success: false, error: "Failed to get online users" });
    }
  });

  // State recovery after reconnection
  socket.on("state:recover", async (data, callback) => {
    try {
      const { lastConnectedAt, missedEvents } = data || {};
      logger.info(`State recovery requested by user ${userId}, last connected: ${lastConnectedAt}`);

      // Get current online users
      const onlineUsers = await getOnlineUsers(tenantId);
      const isOnline = await isUserOnline(userId);
      const deviceCount = await getUserDeviceCount(userId);

      const recoveryState = {
        userId,
        tenantId,
        isOnline,
        deviceCount,
        onlineUsers,
        serverTimestamp: new Date().toISOString(),
        recovered: true,
      };

      socket.emit("state:recovered", recoveryState);

      if (typeof callback === "function") callback({ success: true, data: recoveryState });
    } catch (error) {
      logger.error("state:recover handler error:", error);
      if (typeof callback === "function") callback({ success: false, error: "Failed to recover state" });
    }
  });

  logger.debug(`Presence handlers registered for socket ${socket.id}`);
}
