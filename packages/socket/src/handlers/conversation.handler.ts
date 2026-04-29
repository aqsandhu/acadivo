/**
 * Conversation event handlers
 * Handles conversation listing and management
 */

import { Socket } from "socket.io";
import { AuthenticatedSocket } from "../types/socket";
import { createEventRateLimit } from "../middleware/rateLimit";
import { redisClient } from "../config/redis";
import { logger } from "../utils/logger";

const checkRateLimit = createEventRateLimit();
const CONVERSATION_KEY = (userId: string) => `conversations:${userId}`;

export function registerConversationHandlers(socket: Socket): void {
  const authSocket = socket as AuthenticatedSocket;
  const { userId } = authSocket.user;

  // List user's conversations
  socket.on("conversation:list", async (data, callback) => {
    if (!(await checkRateLimit(socket, "conversation:list"))) {
      if (typeof callback === "function") callback({ success: false, error: "Rate limited" });
      return;
    }

    try {
      const { page = 1, pageSize = 20 } = data || {};

      // Fetch from Redis cache or API
      const cached = await redisClient.get(`${CONVERSATION_KEY(userId)}:list`);
      let conversations: any[] = [];

      if (cached) {
        try {
          conversations = JSON.parse(cached);
        } catch {
          conversations = [];
        }
      }

      // Paginate
      const total = conversations.length;
      const start = (page - 1) * pageSize;
      const paginated = conversations.slice(start, start + pageSize);

      socket.emit("conversation:list:response", {
        success: true,
        data: paginated,
        meta: {
          page,
          pageSize,
          totalCount: total,
          totalPages: Math.ceil(total / pageSize),
        },
      });

      if (typeof callback === "function") callback({ success: true });
    } catch (error) {
      logger.error("conversation:list handler error:", error);
      if (typeof callback === "function") callback({ success: false, error: "Failed to list conversations" });
    }
  });

  // Create a new conversation
  socket.on("conversation:create", async (data, callback) => {
    try {
      const { participantIds, type, title } = data || {};

      if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
        socket.emit("error", { code: "INVALID_INPUT", message: "At least 2 participants required" });
        if (typeof callback === "function") callback({ success: false, error: "Invalid participants" });
        return;
      }

      const conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        participantIds: [...new Set([...participantIds, userId])],
        type: type || "DIRECT",
        title: title || null,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        unreadCount: {},
      };

      // Cache the conversation
      await redisClient.setex(
        `${CONVERSATION_KEY(userId)}:${conversation.id}`,
        86400,
        JSON.stringify(conversation)
      );

      socket.emit("conversation:created", conversation);

      // Notify all participants
      participantIds.forEach((pid: string) => {
        socket.to(`user:${pid}`).emit("conversation:invited", conversation);
      });

      if (typeof callback === "function") callback({ success: true, data: conversation });
    } catch (error) {
      logger.error("conversation:create handler error:", error);
      if (typeof callback === "function") callback({ success: false, error: "Failed to create conversation" });
    }
  });

  logger.debug(`Conversation handlers registered for socket ${socket.id}`);
}
