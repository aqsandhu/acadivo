/**
 * FCM (Firebase Cloud Messaging) event handlers
 * Handles token registration/unregistration for push notifications
 */

import { Socket } from "socket.io";
import { AuthenticatedSocket } from "../types/socket";
import { registerFcmToken, unregisterFcmToken } from "../services/push.service";
import { createEventRateLimit } from "../middleware/rateLimit";
import { logger } from "../utils/logger";

const checkRateLimit = createEventRateLimit();

export function registerFcmHandlers(socket: Socket): void {
  const authSocket = socket as AuthenticatedSocket;
  const { userId } = authSocket.user;

  // Register FCM token
  socket.on("fcm:register", async (data, callback) => {
    if (!(await checkRateLimit(socket, "fcm:register"))) {
      if (typeof callback === "function") callback({ success: false, error: "Rate limited" });
      return;
    }

    try {
      const { token, deviceInfo } = data || {};
      if (!token || typeof token !== "string") {
        socket.emit("error", { code: "INVALID_INPUT", message: "FCM token is required" });
        if (typeof callback === "function") callback({ success: false, error: "Token required" });
        return;
      }

      await registerFcmToken(userId, token, deviceInfo);
      logger.info(`FCM token registered for user ${userId}`);

      if (typeof callback === "function") callback({ success: true });
    } catch (error) {
      logger.error("fcm:register handler error:", error);
      if (typeof callback === "function") callback({ success: false, error: "Failed to register token" });
    }
  });

  // Unregister FCM token
  socket.on("fcm:unregister", async (data, callback) => {
    if (!(await checkRateLimit(socket, "fcm:unregister"))) {
      if (typeof callback === "function") callback({ success: false, error: "Rate limited" });
      return;
    }

    try {
      const { token } = data || {};
      if (!token || typeof token !== "string") {
        socket.emit("error", { code: "INVALID_INPUT", message: "FCM token is required" });
        if (typeof callback === "function") callback({ success: false, error: "Token required" });
        return;
      }

      await unregisterFcmToken(userId, token);
      logger.info(`FCM token unregistered for user ${userId}`);

      if (typeof callback === "function") callback({ success: true });
    } catch (error) {
      logger.error("fcm:unregister handler error:", error);
      if (typeof callback === "function") callback({ success: false, error: "Failed to unregister token" });
    }
  });

  logger.debug(`FCM handlers registered for socket ${socket.id}`);
}
