import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError";

/**
 * Middleware to check express-validator validation results
 */
export function validateRequest(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details: Record<string, string[]> = {};
    errors.array().forEach((err) => {
      if ("param" in err && typeof err.param === "string") {
        if (!details[err.param]) details[err.param] = [];
        details[err.param].push(err.msg);
      }
    });
    return next(ApiError.badRequest("Request validation failed", "VALIDATION_ERROR"));
  }
  next();
}
