// ─────────────────────────────────────────────
// Global Error Handler — Convert ApiError to JSON responses
// ─────────────────────────────────────────────

import { Request, Response, NextFunction } from "express";
import { ApiError } from "../lib/ApiError";
import { ApiResponse } from "../lib/ApiResponse";

export function globalErrorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Log unexpected errors
  console.error("[GlobalError]", err);
  return ApiResponse.error(res, "Internal Server Error", 500, process.env.NODE_ENV === "development" ? err.message : undefined);
}
