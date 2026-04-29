/**
 * @file src/middleware/rateLimiter.ts
 * @description Express-rate-limit configurations for different endpoint categories.
 */

import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError";

/**
 * General API rate limiter: 100 requests per 15 minutes per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next, options) => {
    throw ApiError.unauthorized(`Rate limit exceeded: ${options.max} requests per 15 minutes`, "RATE_LIMITED");
  },
});

/**
 * Strict rate limiter for auth endpoints: 10 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next, options) => {
    throw ApiError.unauthorized(`Too many auth attempts. Max ${options.max} per 15 minutes.`, "AUTH_RATE_LIMITED");
  },
});

/**
 * Limiter for upload endpoints: 20 requests per 15 minutes per IP.
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next, options) => {
    throw ApiError.unauthorized(`Upload rate limit exceeded: ${options.max} per 15 minutes`, "UPLOAD_RATE_LIMITED");
  },
});

/**
 * Limiter for sensitive write operations: 30 requests per 15 minutes per IP.
 */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, _next, options) => {
    throw ApiError.unauthorized(`Write rate limit exceeded: ${options.max} per 15 minutes`, "WRITE_RATE_LIMITED");
  },
});
