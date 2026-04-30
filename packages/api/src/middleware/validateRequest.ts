/**
 * @file src/middleware/validateRequest.ts
 * @description Zod-based request validation middleware.
 * Consolidated: replaces express-validator and Joi with Zod.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import { validationResult, Result, ValidationError } from "express-validator";
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
 * Validate request params with a Zod schema.
 */
export function validateParams<T>(schema: ZodSchema<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      const details = formatZodErrors(parsed.error);
      return next(new ApiError("Invalid URL parameters", 400, true, "INVALID_PARAMS"));
    }
    req.params = parsed.data as any;
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
      return next(new ApiError("Invalid query parameters", 400, true, "INVALID_QUERY"));
    }
    req.query = parsed.data as any;
    next();
  };
}

/**
 * Express-validator result checker.
 * Use after express-validator rule arrays (body(), param(), query()).
 */
export const validateRequest: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().reduce((acc: Record<string, string[]>, err: ValidationError) => {
      const key = "param" in err ? err.param : "msg" in err ? err.msg : "unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(err.msg);
      return acc;
    }, {});
    return next(new ApiError("Validation failed", 400, true, "VALIDATION_ERROR", formatted));
  }
  next();
};
