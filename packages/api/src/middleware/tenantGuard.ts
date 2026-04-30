/**
 * @file src/middleware/tenantGuard.ts
 * @description Ensures the user can only access their tenant's data.
 * Sets tenantId from user context and validates it against the request.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

/**
 * Middleware that enforces tenant isolation.
 * - If user is SUPER_ADMIN, allows all tenants (optional param `allowSuperAdmin=true`).
 * - Otherwise, the request must target the same tenantId as the authenticated user.
 */
export function tenantGuard(allowSuperAdmin = false): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(ApiError.unauthorized("Authentication required", "TENANT_UNAUTHORIZED"));
    }

    // Super admin bypass
    if (allowSuperAdmin && user.role === "SUPER_ADMIN") {
      return next();
    }

    const userTenantId = user.tenantId;
    if (!userTenantId) {
      return next(ApiError.forbidden("User is not associated with a tenant", "TENANT_MISSING"));
    }

    // Check request-level tenant identifiers against user tenant
    const headerTenantId = req.headers["x-tenant-id"] as string | undefined;
    const paramTenantId = req.params.tenantId;
    const bodyTenantId = req.body?.tenantId;
    const queryTenantId = req.query.tenantId as string | undefined;

    const requestTenantId = headerTenantId || paramTenantId || bodyTenantId || queryTenantId;

    if (requestTenantId && requestTenantId !== userTenantId) {
      return next(ApiError.forbidden("Cross-tenant access denied", "TENANT_MISMATCH"));
    }

    // Attach resolved tenantId to request for downstream use
    req.resolvedTenantId = userTenantId;
    next();
  };
}
