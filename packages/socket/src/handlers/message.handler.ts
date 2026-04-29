/**
 * Message handler for chat-related Socket.io events
 * Wires chat service methods to incoming events
 * Includes: private, group, typing, read, history, edit, delete
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
import { createEventRateLimit } from "../middleware/rateLimit";
import { logger } from "../utils/logger";

const checkRateLimit = createEventRateLimit();

// In-memory store for edit/delete operations (should use Redis in production)
const messageStore = new Map<string, any>();

export function registerMessageHandlers(io: Server, socket: Socket): void {
  const authSocket = socket as AuthenticatedSocket;
  const { userId } = authSocket.user;

  // Private message
  socket.on("message:private", async (data, callback) => {
    if (!(await checkRateLimit(socket, "message:private"))) {
      if (typeof callback === "function") callback({ success: false, error: "Rate limited" });
      return;
    }

    try {
      await handlePrivateMessage(io, authSocket, data);
      if (typeof callback === "function") callback({ success: true });
    } catch (error) {
      logger.error("message:private handler error:", error);
      if (typeof callback === "function") callback({ success: false, error: "Failed to send message" });
    }
  });

  // Group message
  socket.on("message:group", async (data, callback) => {
    if (!(await checkRateLimit(socket, "message:group"))) {
      if (typeof callback === "function") callback({ success: false, error: "Rate limited" });
      return;
    }

    try {
      await handleGroupMessage(io, authSocket, data);
      if (typeof callback === "function") callback({ success: true });
    } catch (error) {
      logger.error("message:group handler error:", error);
      if (typeof callback === "function") callback({ success: false, error: "Failed to send group message" });
    }
  });

  // Typing indicator
  socket.on("message:typing", (data, callback) => {
    try {
      handleTyping(authSocket, data);
      if (typeof callback === "function") callback({ success: true });
    } catch (error) {
      logger.error("message:typing handler error:", error);
      if (typeof callback === "function") callback({ success: false, error: "Failed to send typing indicator" });
    }
  });

  // Read receipt
  socket.on("message:read", async (data, callback) => {
    try {
      await handleReadReceipt(io, authSocket, data);
      if (typeof callback === "function") callback({ success: true });
    } catch (error) {
      logger.error("message:read handler error:", error);
      if (typeof callback === "function") callback({ success: false, error: "Failed to mark messages as read" });
    }
  });

  // Conversation history
  socket.on("message:history", async (data, callback) => {
    try {
      await getConversationHistory(authSocket, data);
      if (typeof callback === "function") callback({ success: true });
    } catch (error) {
      logger.error("message:history handler error:", error);
      if (typeof callback === "function") callback({ success: false, error: "Failed to fetch history" });
    }
  });

  // Edit message
  socket.on("message:edit", async (data, callback) => {
    if (!(await checkRateLimit(socket, "message:edit"))) {
      if (typeof callback === "function") callback({ success: false, error: "Rate limited" });
      return;
    }

    try {
      const { messageId, content } = data || {};
      if (!messageId || !content) {
        socket.emit("error", { code: "INVALID_INPUT", message: "messageId and content are required" });
        if (typeof callback === "function") callback({ success: false, error: "Missing fields" });
        return;
      }

      const editedMessage = {
        id: messageId,
        content,
        editedBy: userId,
        editedAt: new Date().toISOString(),
      };

      messageStore.set(messageId, editedMessage);

      // Broadcast edit to relevant parties
      io.to(`user:${data.receiverId}`).to(`group:${data.groupId}`).emit("message:edited", editedMessage);

      if (typeof callback === "function") callback({ success: true, data: editedMessage });
    } catch (error) {
      logger.error("message:edit handler error:", error);
      if (typeof callback === "function") callback({ success: false, error: "Failed to edit message" });
    }
  });

  // Delete message
  socket.on("message:delete", async (data, callback) => {
    if (!(await checkRateLimit(socket, "message:delete"))) {
      if (typeof callback === "function") callback({ success: false, error: "Rate limited" });
      return;
    }

    try {
      const { messageId } = data || {};
      if (!messageId) {
        socket.emit("error", { code: "INVALID_INPUT", message: "messageId is required" });
        if (typeof callback === "function") callback({ success: false, error: "Missing messageId" });
        return;
      }

      messageStore.delete(messageId);

      // Broadcast deletion to relevant parties
      io.to(`user:${data.receiverId}`).to(`group:${data.groupId}`).emit("message:deleted", {
        messageId,
        deletedBy: userId,
        deletedAt: new Date().toISOString(),
      });

      if (typeof callback === "function") callback({ success: true });
    } catch (error) {
      logger.error("message:delete handler error:", error);
      if (typeof callback === "function") callback({ success: false, error: "Failed to delete message" });
    }
  });

  logger.debug(`Message handlers registered for socket ${socket.id}`);
}
