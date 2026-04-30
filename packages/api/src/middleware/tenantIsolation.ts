/**
 * @file src/middleware/tenantIsolation.ts
 * @description Tenant isolation middleware. Extracts tenantId from params/query/body,
 * compares with req.user.tenantId, rejects with 403 if mismatch (except SUPER_ADMIN).
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

/**
 * Middleware factory that enforces tenant isolation.
 * - Extracts tenantId from request (params, query, body, or x-tenant-id header).
 * - Compares with authenticated user's tenantId.
 * - SUPER_ADMIN bypasses the check.
 * - Rejects with 403 Forbidden if tenant mismatch.
 */
export function tenantIsolation(allowSuperAdmin = true): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(ApiError.unauthorized("Authentication required", "TENANT_AUTH_REQUIRED"));
    }

    // Super admin bypass
    if (allowSuperAdmin && user.role === "SUPER_ADMIN") {
      return next();
    }

    const userTenantId = user.tenantId;
    if (!userTenantId) {
      return next(ApiError.forbidden("User is not associated with a tenant", "TENANT_MISSING"));
    }

    // Extract tenantId from all possible request sources
    const paramTenantId = req.params.tenantId;
    const queryTenantId = req.query.tenantId as string | undefined;
    const bodyTenantId = req.body?.tenantId;
    const headerTenantId = req.headers["x-tenant-id"] as string | undefined;

    const requestTenantId = paramTenantId || queryTenantId || bodyTenantId || headerTenantId;

    // If a tenantId is explicitly provided in the request, validate it matches
    if (requestTenantId && requestTenantId !== userTenantId) {
      return next(ApiError.forbidden("Cross-tenant access denied", "TENANT_MISMATCH"));
    }

    // Attach resolved tenantId to request for downstream use
    req.resolvedTenantId = userTenantId;
    next();
  };
}

/**
 * Alias for backward compatibility with existing tenantGuard usage.
 */
export const tenantGuard = tenantIsolation;
