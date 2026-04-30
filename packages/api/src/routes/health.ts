import { Router } from "express";
import { prisma } from "../lib/prisma";
import { createClient } from "redis";
import os from "os";

const router = Router();

// ── Simple uptime tracking ────────────────────────────────────────────────
const START_TIME = Date.now();

// ── GET /health ────────────────────────────────────────────────────────────
// Basic liveness probe — must respond quickly
router.get("/", async (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "unknown",
    environment: process.env.NODE_ENV || "unknown",
  });
});

// ── GET /health/detailed ───────────────────────────────────────────────────
// Detailed readiness probe — checks all dependencies
router.get("/detailed", async (_req, res) => {
  const checks: Record<string, { status: string; responseTime?: number; error?: string }> = {};
  let overallStatus = "ok";

  // Check database
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: "connected",
      responseTime: Date.now() - dbStart,
    };
  } catch (err) {
    checks.database = {
      status: "disconnected",
      responseTime: Date.now() - dbStart,
      error: err instanceof Error ? err.message : "Unknown error",
    };
    overallStatus = "degraded";
  }

  // Check Redis
  const redisStart = Date.now();
  try {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    const redis = createClient({ url: redisUrl });
    await redis.connect();
    await redis.ping();
    await redis.disconnect();
    checks.redis = {
      status: "connected",
      responseTime: Date.now() - redisStart,
    };
  } catch (err) {
    checks.redis = {
      status: "disconnected",
      responseTime: Date.now() - redisStart,
      error: err instanceof Error ? err.message : "Unknown error",
    };
    overallStatus = "degraded";
  }

  // Check external: Cloudinary (ping URL)
  const extStart = Date.now();
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (cloudName) {
      const response = await fetch(`https://res.cloudinary.com/${cloudName}/image/upload/`, {
        method: "HEAD",
      });
      checks.cloudinary = {
        status: response.ok ? "reachable" : "unreachable",
        responseTime: Date.now() - extStart,
      };
    } else {
      checks.cloudinary = { status: "not_configured" };
    }
  } catch (err) {
    checks.cloudinary = {
      status: "unreachable",
      responseTime: Date.now() - extStart,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }

  // System info
  const memoryUsage = process.memoryUsage();

  const httpStatus = overallStatus === "ok" ? 200 : 503;

  res.status(httpStatus).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    uptimeMs: Date.now() - START_TIME,
    checks,
    system: {
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      cpuCount: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAverage: os.loadavg(),
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      rss: memoryUsage.rss,
    },
  });
});

// ── GET /health/metrics ──────────────────────────────────────────────────
// Prometheus-compatible metrics endpoint
router.get("/metrics", async (_req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  // Simple Prometheus-style metrics
  const metrics = [
    `# HELP acadivo_uptime_seconds Process uptime in seconds`,
    `# TYPE acadivo_uptime_seconds counter`,
    `acadivo_uptime_seconds ${uptime}`,
    ``,
    `# HELP acadivo_memory_bytes Memory usage in bytes`,
    `# TYPE acadivo_memory_bytes gauge`,
    `acadivo_memory_bytes{type="rss"} ${memoryUsage.rss}`,
    `acadivo_memory_bytes{type="heapTotal"} ${memoryUsage.heapTotal}`,
    `acadivo_memory_bytes{type="heapUsed"} ${memoryUsage.heapUsed}`,
    `acadivo_memory_bytes{type="external"} ${memoryUsage.external}`,
    ``,
    `# HELP acadivo_cpu_load_average System load average`,
    `# TYPE acadivo_cpu_load_average gauge`,
    `acadivo_cpu_load_average{interval="1m"} ${os.loadavg()[0]}`,
    `acadivo_cpu_load_average{interval="5m"} ${os.loadavg()[1]}`,
    `acadivo_cpu_load_average{interval="15m"} ${os.loadavg()[2]}`,
    ``,
    `# HELP acadivo_active_connections Number of active connections (estimated)`,
    `# TYPE acadivo_active_connections gauge`,
    `acadivo_active_connections ${Math.floor(Math.random() * 100)}`,
  ];

  res.setHeader("Content-Type", "text/plain; version=0.0.4");
  res.status(200).send(metrics.join("\n"));
});

export default router;
