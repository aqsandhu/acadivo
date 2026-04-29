/**
 * @file src/utils/tenant.ts
 * @description Tenant extraction from headers, subdomains, or JWT context.
 */

import { Request } from "express";

/**
 * Extract tenant identifier from request headers or subdomain.
 * Priority: 1) x-tenant-id header, 2) x-tenant-code header, 3) subdomain.
 */
export function extractTenantIdentifier(req: Request): { tenantId?: string; tenantCode?: string } {
  const tenantId = req.headers["x-tenant-id"] as string | undefined;
  const tenantCode = req.headers["x-tenant-code"] as string | undefined;

  if (tenantId || tenantCode) {
    return { tenantId, tenantCode };
  }

  // Subdomain extraction: tenant.acadivo.com
  const host = req.headers.host || "";
  const subdomain = host.split(".")[0];
  if (subdomain && subdomain !== "www" && subdomain !== "localhost" && subdomain !== "api") {
    return { tenantCode: subdomain };
  }

  return {};
}

/**
 * Middleware-level helper: resolve tenantId from authenticated user or headers.
 * Prefer user context when available (ensures RBAC).
 */
export function resolveTenantId(req: Request): string | null {
  const userTenantId = (req as any).user?.tenantId;
  if (userTenantId) return userTenantId;

  const { tenantId } = extractTenantIdentifier(req);
  return tenantId || null;
}
