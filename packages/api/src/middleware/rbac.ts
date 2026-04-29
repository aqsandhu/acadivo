/**
 * @file src/middleware/rbac.ts
 * @description Role-based access control middleware. Accepts allowed roles array,
 * checks req.user.role against it.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import { UserRole } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

/**
 * Middleware factory that restricts access to specific roles.
 * @param allowedRoles - Array of permitted UserRole values
 */
export function rbacMiddleware(allowedRoles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role as UserRole | undefined;
    if (!userRole) {
      return next(ApiError.unauthorized("User role not found in request context", "RBAC_UNAUTHORIZED"));
    }
    if (!allowedRoles.includes(userRole)) {
      return next(ApiError.forbidden(`Access denied for role: ${userRole}`, "RBAC_FORBIDDEN"));
    }
    next();
  };
}
