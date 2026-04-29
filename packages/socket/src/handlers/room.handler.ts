/**
 * Room handler for join/leave room events
 */

import { Socket } from "socket.io";
import { AuthenticatedSocket, RoomJoinData, RoomLeaveData } from "../types/socket";
import { logger } from "../utils/logger";

export function registerRoomHandlers(socket: Socket): void {
  const authSocket = socket as AuthenticatedSocket;

  socket.on("join:room", (data: RoomJoinData, callback) => {
    try {
      const { room } = data;
      if (!room) {
        socket.emit("error", { code: "INVALID_PAYLOAD", message: "room is required" });
        if (typeof callback === "function") {
          callback({ success: false, error: "room is required" });
        }
        return;
      }

      socket.join(room);
      logger.info(`Socket ${socket.id} (User ${authSocket.user.userId}) joined room: ${room}`);
      socket.emit("room:joined", { room });

      if (typeof callback === "function") {
        callback({ success: true, room });
      }
    } catch (error) {
      logger.error("join:room handler error:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: "Failed to join room" });
      }
    }
  });

  socket.on("leave:room", (data: RoomLeaveData, callback) => {
    try {
      const { room } = data;
      if (!room) {
        socket.emit("error", { code: "INVALID_PAYLOAD", message: "room is required" });
        if (typeof callback === "function") {
          callback({ success: false, error: "room is required" });
        }
        return;
      }

      socket.leave(room);
      logger.info(`Socket ${socket.id} (User ${authSocket.user.userId}) left room: ${room}`);
      socket.emit("room:left", { room });

      if (typeof callback === "function") {
        callback({ success: true, room });
      }
    } catch (error) {
      logger.error("leave:room handler error:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: "Failed to leave room" });
      }
    }
  });

  logger.debug(`Room handlers registered for socket ${socket.id}`);
}
