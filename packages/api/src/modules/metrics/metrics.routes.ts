import { Router, Request, Response } from "express";
import { register } from "./metrics";

const router = Router();

/**
 * GET /health/metrics
 * Expose Prometheus metrics endpoint for scraping.
 * Returns real application metrics (not random data).
 */
router.get("/metrics", async (_req: Request, res: Response) => {
  try {
    res.setHeader("Content-Type", register.contentType);
    const metrics = await register.metrics();
    res.status(200).send(metrics);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to collect metrics",
    });
  }
});

/**
 * GET /health/metrics/json
 * Expose metrics in JSON format for debugging.
 */
router.get("/metrics/json", async (_req: Request, res: Response) => {
  try {
    const metrics = await register.getMetricsAsJSON();
    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to collect metrics",
    });
  }
});

export default router;
