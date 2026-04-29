/**
 * @file src/middleware/requestValidator.ts
 * @description Generic request body/params/query validator using Zod.
 */

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

export function validateBodyZod<T>(schema: ZodSchema<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new ApiError("Validation failed", 400, true, "VALIDATION_ERROR")
      );
    }
    req.body = parsed.data;
    next();
  };
}

export function validateQueryZod<T>(schema: ZodSchema<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return next(
        new ApiError("Query validation failed", 400, true, "INVALID_QUERY")
      );
    }
    req.query = parsed.data as any;
    next();
  };
}

export function validateParamsZod<T>(schema: ZodSchema<T>): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      return next(
        new ApiError("Parameter validation failed", 400, true, "INVALID_PARAMS")
      );
    }
    req.params = parsed.data as any;
    next();
  };
}
