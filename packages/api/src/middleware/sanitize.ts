/**
 * @file src/middleware/sanitize.ts
 * @description XSS prevention middleware — sanitizes request bodies by stripping
 * dangerous HTML tags, event handlers, and URI-based attack vectors.
 */

import { Request, Response, NextFunction } from "express";

export function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
}

function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/javascript:/gi, "")
      .replace(/data:/gi, "")
      .replace(/on\w+\s*=/gi, "");
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
}
