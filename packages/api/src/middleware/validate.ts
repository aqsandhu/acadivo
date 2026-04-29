// ─────────────────────────────────────────────
// Validate Middleware — Zod-based validation
// Replaces express-validator with Zod schemas
// ─────────────────────────────────────────────

import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  error.errors.forEach((e) => {
    const path = e.path.join(".") || "root";
    if (!result[path]) result[path] = [];
    result[path].push(e.message);
  });
  return result;
}

/**
 * Validate request body with a Zod schema.
 */
export function validateBody<T>(schema: ZodSchema<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const details = formatZodErrors(parsed.error);
      return next(new ApiError("Validation failed", 400, true, "VALIDATION_ERROR"));
    }
    req.body = parsed.data;
    next();
  };
}

/**
 * Validate request query with a Zod schema.
 */
export function validateQuery<T>(schema: ZodSchema<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      const details = formatZodErrors(parsed.error);
      return next(new ApiError("Query validation failed", 400, true, "INVALID_QUERY"));
    }
    req.query = parsed.data as any;
    next();
  };
}

/**
 * Validate request params with a Zod schema.
 */
export function validateParams<T>(schema: ZodSchema<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      const details = formatZodErrors(parsed.error);
      return next(new ApiError("Parameter validation failed", 400, true, "INVALID_PARAMS"));
    }
    req.params = parsed.data as any;
    next();
  };
}

/**
 * Legacy validate wrapper for backward compatibility.
 * @param schema - Zod schema to validate against
 * @param source - Which request property to validate (body, query, params)
 */
export function validate<T>(schema: ZodSchema<T>, source: "body" | "query" | "params" = "body"): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const target = req[source];
    const parsed = schema.safeParse(target);
    if (!parsed.success) {
      const details = formatZodErrors(parsed.error);
      return next(new ApiError("Validation failed", 400, true, "VALIDATION_ERROR"));
    }
    (req as any)[source] = parsed.data;
    next();
  };
}
