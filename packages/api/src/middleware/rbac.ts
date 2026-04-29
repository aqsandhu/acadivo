/**
 * @file src/middleware/rbac.ts
 * @description Role-based access control middleware factory and specific role guards.
 * Accepts allowed roles array, checks req.user.role against it.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import { UserRole } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

/**
 * Middleware factory that restricts access to specific roles.
 * @param allowedRoles - Array of permitted UserRole values
 */
export function requireRole(...allowedRoles: UserRole[]): RequestHandler {
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

/**
 * Legacy RBAC middleware factory (alias for backward compatibility).
 */
export function rbacMiddleware(allowedRoles: UserRole[]): RequestHandler {
  return requireRole(...allowedRoles);
}

// ── Specific Role Guards ─────────────────────────

/** Only SUPER_ADMIN */
export const requireSuperAdmin = requireRole(UserRole.SUPER_ADMIN);

/** ADMIN or SUPER_ADMIN */
export const requireAdmin = requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/** PRINCIPAL, ADMIN, or SUPER_ADMIN */
export const requirePrincipal = requireRole(UserRole.PRINCIPAL, UserRole.ADMIN, UserRole.SUPER_ADMIN);

/** TEACHER and above */
export const requireTeacher = requireRole(UserRole.TEACHER, UserRole.PRINCIPAL, UserRole.ADMIN, UserRole.SUPER_ADMIN);

/** STUDENT and above */
export const requireStudent = requireRole(UserRole.STUDENT, UserRole.TEACHER, UserRole.PRINCIPAL, UserRole.ADMIN, UserRole.SUPER_ADMIN);

/** PARENT and above */
export const requireParent = requireRole(UserRole.PARENT, UserRole.PRINCIPAL, UserRole.ADMIN, UserRole.SUPER_ADMIN);
