import { Server as SocketIOServer } from "socket.io";
import { createClient } from "redis";
import { getRedisAdapter } from "../adapters/redis";

interface HealthStatus {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  uptime: number;
  socketConnections: number;
  redisAdapter: string;
  rooms: number;
  checks: Record<string, { status: string; error?: string }>;
}

let startTime = Date.now();

/**
 * Register health check endpoints on the Socket.io server
 */
export function registerHealthChecks(io: SocketIOServer, app: any): void {
  // GET /health — Basic health check
  app.get("/health", (_req: any, res: any) => {
    const uptime = process.uptime();
    const connections = io.sockets.sockets.size;

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
      const adapter = io.of("/").adapter;
      const isRedisAdapter = adapter.constructor.name.includes("Redis");
      checks.redisAdapter = {
        status: isRedisAdapter ? "connected" : "fallback_memory",
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
      const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
      const redis = createClient({ url: redisUrl });
      await redis.connect();
      await redis.ping();
      await redis.disconnect();
      checks.redis = { status: "connected" };
    } catch (err) {
      checks.redis = {
        status: "error",
        error: err instanceof Error ? err.message : "Unknown",
      };
      overallStatus = "error";
    }

    // Socket stats
    const connections = io.sockets.sockets.size;
    const rooms = io.sockets.adapter.rooms.size;

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
    const connections = io.sockets.sockets.size;
    const rooms = io.sockets.adapter.rooms.size;
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
}
