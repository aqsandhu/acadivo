/**
 * @file src/middleware/httpsEnforcement.ts
 * @description HTTPS enforcement middleware with HSTS header injection.
 * Redirects all HTTP traffic to HTTPS in production environments.
 */

import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export function enforceHTTPS(req: Request, res: Response, next: NextFunction) {
  if (env.NODE_ENV !== "production") return next();
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    return next();
  }
  res.redirect(301, `https://${req.headers.host}${req.url}`);
}
