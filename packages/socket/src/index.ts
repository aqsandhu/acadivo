/**
 * Socket.io real-time server main entry for Acadivo
 * 
 * Features:
 * - Socket.io server on port 5001
 * - CORS for web app + mobile origins
 * - Redis adapter for multi-node scaling
 * - JWT authentication middleware
 * - Connection/disconnection logging
 * - Health check endpoint
 */

import { createServer } from "http";
import { Server } from "socket.io";
import { env } from "./config/env";
import { connectRedis, disconnectRedis, getRedisAdapter } from "./config/redis";
import { registerConnectionHandlers } from "./handlers/connection.handler";
import { registerMessageHandlers } from "./handlers/message.handler";
import { registerNotificationHandlers } from "./handlers/notification.handler";
import { registerRoomHandlers } from "./handlers/room.handler";
import { logger } from "./utils/logger";

const PORT = env.PORT;

const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "acadivo-socket",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      })
    );
    return;
  }

  // Default response
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "not_found" }));
});

const io = new Server(httpServer, {
  cors: {
    origin: env.CORS_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

async function startServer(): Promise<void> {
  try {
    // Connect Redis clients and setup adapter
    await connectRedis();
    io.adapter(getRedisAdapter());
    logger.info("Redis adapter attached to Socket.io");

    // Register global connection handlers (includes auth middleware)
    registerConnectionHandlers(io);

    // Register per-socket handlers after connection
    io.on("connection", (socket) => {
      registerMessageHandlers(io, socket);
      registerNotificationHandlers(socket);
      registerRoomHandlers(socket);
    });

    httpServer.listen(PORT, () => {
      logger.info(`⚡ Acadivo Socket.io server running on http://localhost:${PORT}`);
      logger.info(`📝 Health check available at http://localhost:${PORT}/health`);
      logger.info(`🌐 CORS origins: ${env.CORS_ORIGINS.join(", ")}`);
      logger.info(`🔌 Redis adapter active for multi-node scaling`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  io.close(() => {
    logger.info("Socket.io server closed");
  });

  httpServer.close(() => {
    logger.info("HTTP server closed");
  });

  await disconnectRedis();
  logger.info("Redis clients disconnected");

  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Unhandled errors
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
});

startServer();
