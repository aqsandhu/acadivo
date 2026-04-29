/**
 * @file src/utils/asyncHandler.ts
 * @description Wraps async Express route handlers to automatically catch errors
 * and forward them to the global error handler via `next()`.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wrap an async route handler so rejected Promises are caught.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
