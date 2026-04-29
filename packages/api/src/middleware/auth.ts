/**
 * @file src/middleware/auth.ts
 * @description JWT verification middleware. Extracts Bearer token, verifies it,
 * and attaches { userId, role, tenantId, uniqueId } to req.user.
 */

import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { userId: string; role: string; tenantId: string | null; uniqueId: string };
    }
  }
}

/**
 * Alias for authMiddleware for route-level use.
 */
export const authenticate = authMiddleware;

/**
 * Role-based access control middleware factory.
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required", "AUTH_REQUIRED"));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to perform this action", "RBAC_FORBIDDEN"));
    }
    next();
  };
}
