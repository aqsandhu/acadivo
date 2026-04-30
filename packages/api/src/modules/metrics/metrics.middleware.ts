import { Request, Response, NextFunction } from "express";
import { httpRequestCounter, httpRequestDuration } from "./metrics";

/**
 * Express middleware to automatically collect HTTP request metrics.
 * Tracks request count and duration with method, route, and status labels.
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();

  // Capture the original end function
  const originalEnd = res.end.bind(res);

  // Override res.end to capture response status
  res.end = function (chunk?: any, encoding?: any, cb?: any): Response {
    const duration = Number(process.hrtime.bigint() - start) / 1e9; // Convert to seconds
    const route = req.route?.path || req.path || "/unknown";
    const status = res.statusCode.toString();
    const method = req.method;

    httpRequestCounter.inc({ method, route, status });
    httpRequestDuration.observe({ method, route, status }, duration);

    // Call the original end function
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = undefined;
    }
    originalEnd(chunk, encoding, cb);
    return res;
  } as any;

  next();
}
