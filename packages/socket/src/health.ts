/**
 * Socket server health checks with Redis adapter integration
 */

import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import { redisClient, pubClient, subClient } from "./config/redis";
import { logger } from "./utils/logger";

interface HealthStatus {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  uptime: number;
  socketConnections: number;
  redisAdapter: string;
  rooms: number;
  checks: Record<string, { status: string; error?: string; responseTime?: number }>;
}

let startTime = Date.now();

/**
 * Create a Redis adapter for Socket.io using existing pub/sub clients
 */
export function createRedisAdapter(): ReturnType<typeof createAdapter> {
  return createAdapter(pubClient, subClient, {
    key: "acadivo:socket.io",
  });
}

/**
 * Register health check endpoints on the Socket.io server
 */
export function registerHealthChecks(io: SocketIOServer, app: any): void {
  // GET /health — Basic health check
  app.get("/health", (_req: any, res: any) => {
    const uptime = process.uptime();
    const connections = io.sockets?.sockets?.size || 0;

    res.status(200).json({
      status: "ok",
      service: "socket",
      uptime,
      timestamp: new Date().toISOString(),
      connections,
      version: process.env.npm_package_version || "unknown",
    });
  });

  // GET /health/detailed — Detailed health check
  app.get("/health/detailed", async (_req: any, res: any) => {
    const checks: HealthStatus["checks"] = {};
    let overallStatus: HealthStatus["status"] = "ok";

    // Check Redis adapter connection
    try {
      const start = Date.now();
      const adapter = io.of("/").adapter;
      const isRedisAdapter = adapter?.constructor?.name?.includes("Redis") || false;
      checks.redisAdapter = {
        status: isRedisAdapter ? "connected" : "fallback_memory",
        responseTime: Date.now() - start,
      };
      if (!isRedisAdapter) {
        overallStatus = "degraded";
      }
    } catch (err) {
      checks.redisAdapter = {
        status: "error",
        error: err instanceof Error ? err.message : "Unknown",
      };
      overallStatus = "error";
    }

    // Check Redis ping
    try {
      const start = Date.now();
      await redisClient.ping();
      checks.redis = {
        status: "connected",
        responseTime: Date.now() - start,
      };
    } catch (err) {
      checks.redis = {
        status: "error",
        error: err instanceof Error ? err.message : "Unknown",
      };
      overallStatus = "error";
    }

    // Check Redis pub/sub clients
    try {
      const start = Date.now();
      await pubClient.ping();
      await subClient.ping();
      checks.redisPubSub = {
        status: "connected",
        responseTime: Date.now() - start,
      };
    } catch (err) {
      checks.redisPubSub = {
        status: "error",
        error: err instanceof Error ? err.message : "Unknown",
      };
      overallStatus = "error";
    }

    // Socket stats
    const connections = io.sockets?.sockets?.size || 0;
    const rooms = io.sockets?.adapter?.rooms?.size || 0;

    const httpStatus = overallStatus === "ok" ? 200 : 503;

    res.status(httpStatus).json({
      status: overallStatus,
      service: "socket",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      uptimeMs: Date.now() - startTime,
      socketConnections: connections,
      redisAdapter: checks.redisAdapter?.status || "unknown",
      rooms,
      checks,
    } as HealthStatus);
  });

  // GET /health/metrics — Prometheus metrics
  app.get("/health/metrics", (_req: any, res: any) => {
    const connections = io.sockets?.sockets?.size || 0;
    const rooms = io.sockets?.adapter?.rooms?.size || 0;
    const memoryUsage = process.memoryUsage();

    const metrics = [
      `# HELP socketio_connections_active Current active Socket.io connections`,
      `# TYPE socketio_connections_active gauge`,
      `socketio_connections_active ${connections}`,
      ``,
      `# HELP socketio_rooms_total Total number of active rooms`,
      `# TYPE socketio_rooms_total gauge`,
      `socketio_rooms_total ${rooms}`,
      ``,
      `# HELP socketio_memory_bytes Memory usage in bytes`,
      `# TYPE socketio_memory_bytes gauge`,
      `socketio_memory_bytes{type="rss"} ${memoryUsage.rss}`,
      `socketio_memory_bytes{type="heapUsed"} ${memoryUsage.heapUsed}`,
      ``,
      `# HELP socketio_uptime_seconds Process uptime in seconds`,
      `# TYPE socketio_uptime_seconds counter`,
      `socketio_uptime_seconds ${process.uptime()}`,
    ];

    res.setHeader("Content-Type", "text/plain; version=0.0.4");
    res.status(200).send(metrics.join("\n"));
  });

  logger.info("Health check endpoints registered");
}
