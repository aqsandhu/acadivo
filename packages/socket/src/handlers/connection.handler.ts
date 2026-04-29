/**
 * Connection handler for Socket.io client lifecycle
 * Manages authentication, room joining, presence, and disconnection
 */

import { Server, Socket } from "socket.io";
import { AuthenticatedSocket } from "../types/socket";
import { socketAuthMiddleware } from "../middleware/socketAuth";
import { setupRooms, leaveAllRooms } from "../services/room.service";
import { setOnline, setOffline, getOnlineUsers, broadcastPresenceUpdate, refreshOnlineStatus } from "../services/presence.service";
import { logger } from "../utils/logger";

const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds
const HEARTBEAT_TIMEOUT_MS = 60000; // 60 seconds

export function registerConnectionHandlers(io: Server): void {
  io.use(socketAuthMiddleware);

  io.on("connection", async (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const { userId, role, tenantId, name } = authSocket.user;

    logger.info(`Client connected: ${socket.id} — User ${userId} (${role}) — Tenant ${tenantId}`);

    try {
      // 1. Join user, tenant, role, and notification rooms
      setupRooms(authSocket);

      // 2. Set user as online
      await setOnline(userId, tenantId);
      await broadcastPresenceUpdate(io, userId, tenantId, "online");

      // 3. Get current online users for tenant
      const onlineUsers = await getOnlineUsers(tenantId);

      // 4. Emit connected event with user data and online users list
      authSocket.emit("connected", {
        socketId: socket.id,
        user: authSocket.user,
        onlineUsers,
        timestamp: new Date().toISOString(),
      });

      // Heartbeat / presence refresh interval
      const heartbeatInterval = setInterval(async () => {
        try {
          await refreshOnlineStatus(userId, tenantId);
        } catch (error) {
          logger.error(`Heartbeat refresh failed for user ${userId}:`, error);
        }
      }, HEARTBEAT_INTERVAL_MS);

      // Handle manual disconnect request
      socket.on("disconnect:request", (reason, callback) => {
        logger.info(`Disconnect requested for socket ${socket.id}: ${reason}`);
        if (typeof callback === "function") {
          callback({ success: true });
        }
        socket.disconnect(true);
      });

      // Handle connection error from client side
      socket.on("error", (err) => {
        logger.error(`Client error from socket ${socket.id}:`, err);
      });

      // On disconnect
      socket.on("disconnect", async (reason) => {
        clearInterval(heartbeatInterval);

        logger.info(
          `Client disconnected: ${socket.id} — User ${userId} — Reason: ${reason}`
        );

        try {
          // 1. Set user offline
          await setOffline(userId, tenantId);
          await broadcastPresenceUpdate(io, userId, tenantId, "offline");

          // 2. Leave all rooms
          leaveAllRooms(socket);
        } catch (error) {
          logger.error(`Error during disconnect cleanup for user ${userId}:`, error);
        }
      });
    } catch (error) {
      logger.error(`Error during connection setup for socket ${socket.id}:`, error);
      socket.emit("error", { code: "CONNECTION_SETUP_FAILED", message: "Failed to complete connection setup" });
      socket.disconnect(true);
    }
  });
}
