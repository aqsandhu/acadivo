/**
 * Message handler for chat-related Socket.io events
 * Wires chat service methods to incoming events
 */

import { Server, Socket } from "socket.io";
import { AuthenticatedSocket } from "../types/socket";
import {
  handlePrivateMessage,
  handleGroupMessage,
  handleTyping,
  handleReadReceipt,
  getConversationHistory,
} from "../services/chat.service";
import { logger } from "../utils/logger";

export function registerMessageHandlers(io: Server, socket: Socket): void {
  const authSocket = socket as AuthenticatedSocket;

  // Private message
  socket.on("message:private", async (data, callback) => {
    try {
      await handlePrivateMessage(io, authSocket, data);
      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (error) {
      logger.error("message:private handler error:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: "Failed to send message" });
      }
    }
  });

  // Group message
  socket.on("message:group", async (data, callback) => {
    try {
      await handleGroupMessage(io, authSocket, data);
      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (error) {
      logger.error("message:group handler error:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: "Failed to send group message" });
      }
    }
  });

  // Typing indicator
  socket.on("message:typing", (data, callback) => {
    try {
      handleTyping(authSocket, data);
      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (error) {
      logger.error("message:typing handler error:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: "Failed to send typing indicator" });
      }
    }
  });

  // Read receipt
  socket.on("message:read", async (data, callback) => {
    try {
      await handleReadReceipt(io, authSocket, data);
      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (error) {
      logger.error("message:read handler error:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: "Failed to mark messages as read" });
      }
    }
  });

  // Conversation history
  socket.on("message:history", async (data, callback) => {
    try {
      await getConversationHistory(authSocket, data);
      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (error) {
      logger.error("message:history handler error:", error);
      if (typeof callback === "function") {
        callback({ success: false, error: "Failed to fetch history" });
      }
    }
  });

  logger.debug(`Message handlers registered for socket ${socket.id}`);
}
