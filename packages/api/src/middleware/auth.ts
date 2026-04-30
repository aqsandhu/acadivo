/**
 * @file src/middleware/auth.ts
 * @description JWT verification middleware. Extracts Bearer token, verifies it,
 * and attaches { userId, role, tenantId, uniqueId } to req.user.
 */

import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { prisma } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { userId: string; role: string; tenantId: string | null; uniqueId: string };
    }
  }
}

/**
 * Main authentication middleware.
 * Extracts Bearer token from Authorization header, verifies JWT,
 * checks user existence and active status, and attaches decoded payload to req.user.
 */
export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Access token required", "AUTH_NO_TOKEN"));
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    const decoded = verifyToken(token, "access");

    // Verify user still exists and is active in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isActive: true },
    });
    if (!user || !user.isActive) {
      return next(ApiError.unauthorized("User not found or inactive", "AUTH_USER_INVALID"));
    }

    req.user = decoded as any;
    next();
  } catch (err) {
    next(err);
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

/**
 * Require specific role guards (re-exported from RBAC for convenience).
 */
export const requireSuperAdmin = authorize("SUPER_ADMIN");
export const requireAdmin = authorize("ADMIN", "SUPER_ADMIN");
export const requirePrincipal = authorize("PRINCIPAL", "SUPER_ADMIN");
export const requireTeacher = authorize("TEACHER", "PRINCIPAL", "ADMIN", "SUPER_ADMIN");
export const requireStudent = authorize("STUDENT", "SUPER_ADMIN");
export const requireParent = authorize("PARENT", "SUPER_ADMIN");

/**
 * AuthRequest type alias for controllers.
 */
export interface AuthRequest extends Request {
  user: TokenPayload & { userId: string; role: string; tenantId: string | null; uniqueId: string };
}
