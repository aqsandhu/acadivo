// ─────────────────────────────────────────────
// Health Routes — System health monitoring
// ─────────────────────────────────────────────

import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { redis } from "../../config/redis";

const router = Router();

// ── Basic Health Check ──
router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "acadivo-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Database Health Check ──
router.get("/db", async (_req: Request, res: Response) => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    res.status(200).json({
      status: "ok",
      service: "database",
      connected: true,
      latencyMs: latency,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(503).json({
      status: "error",
      service: "database",
      connected: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ── Redis Health Check ──
router.get("/redis", async (_req: Request, res: Response) => {
  try {
    const start = Date.now();
    await redis.ping();
    const latency = Date.now() - start;

    res.status(200).json({
      status: "ok",
      service: "redis",
      connected: true,
      latencyMs: latency,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(503).json({
      status: "error",
      service: "redis",
      connected: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
