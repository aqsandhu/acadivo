/**
 * @file src/middleware/superAdminPermissions.ts
 * @description Granular permission middleware for Super Admin role.
 * Allows super admins to assign and check specific action permissions.
 */

import { Request, Response, NextFunction, RequestHandler } from "express";
import { UserRole } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

// ── Permission Actions ──────────────────────

export const SuperAdminPermission = {
  MANAGE_SCHOOLS: "manage:schools",
  MANAGE_USERS: "manage:users",
  MANAGE_SUBSCRIPTIONS: "manage:subscriptions",
  MANAGE_ADS: "manage:ads",
  MANAGE_ANNOUNCEMENTS: "manage:announcements",
  VIEW_ANALYTICS: "view:analytics",
  MANAGE_SETTINGS: "manage:settings",
  MANAGE_PERMISSIONS: "manage:permissions",
  BULK_OPERATIONS: "bulk:operations",
  DELETE_DATA: "delete:data",
} as const;

export type SuperAdminPermissionType = typeof SuperAdminPermission[keyof typeof SuperAdminPermission];

// ── Permission Check Middleware ───────────────

/**
 * Middleware that checks if a SUPER_ADMIN has a specific granular permission.
 * Falls back to allowing the action if the user is the original super admin (no permissions field).
 * @param requiredPermission - The permission string to check
 */
export function requireSuperAdminPermission(requiredPermission: SuperAdminPermissionType): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role as UserRole | undefined;
    const userPermissions = (req.user?.permissions as string[]) || [];

    if (userRole !== UserRole.SUPER_ADMIN) {
      return next(ApiError.forbidden("Super Admin access required", "SA_PERMISSION_DENIED"));
    }

    // If no permissions array is set (legacy super admin), allow all
    if (!userPermissions || userPermissions.length === 0) {
      return next();
    }

    // Check if user has the required permission
    if (!userPermissions.includes(requiredPermission)) {
      return next(ApiError.forbidden(
        `Permission denied: ${requiredPermission}`,
        "SA_GRANULAR_DENIED"
      ));
    }

    next();
  };
}

/**
 * Middleware factory that checks multiple permissions (any of them)
 */
export function requireAnySuperAdminPermission(...permissions: SuperAdminPermissionType[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role as UserRole | undefined;
    const userPermissions = (req.user?.permissions as string[]) || [];

    if (userRole !== UserRole.SUPER_ADMIN) {
      return next(ApiError.forbidden("Super Admin access required", "SA_PERMISSION_DENIED"));
    }

    if (!userPermissions || userPermissions.length === 0) {
      return next();
    }

    const hasAny = permissions.some((p) => userPermissions.includes(p));
    if (!hasAny) {
      return next(ApiError.forbidden(
        `Permission denied: requires any of [${permissions.join(", ")}]`,
        "SA_GRANULAR_DENIED"
      ));
    }

    next();
  };
}

/**
 * Utility to check if a super admin user object has a permission
 */
export function hasSuperAdminPermission(
  user: { role?: UserRole; permissions?: string[] },
  permission: SuperAdminPermissionType
): boolean {
  if (user.role !== UserRole.SUPER_ADMIN) return false;
  const perms = user.permissions || [];
  if (perms.length === 0) return true; // legacy super admin = all permissions
  return perms.includes(permission);
}

// ── All Permissions List ──────────────────────

export function getAllSuperAdminPermissions(): { key: string; label: string }[] {
  return [
    { key: SuperAdminPermission.MANAGE_SCHOOLS, label: "Manage Schools" },
    { key: SuperAdminPermission.MANAGE_USERS, label: "Manage Users" },
    { key: SuperAdminPermission.MANAGE_SUBSCRIPTIONS, label: "Manage Subscriptions" },
    { key: SuperAdminPermission.MANAGE_ADS, label: "Manage Advertisements" },
    { key: SuperAdminPermission.MANAGE_ANNOUNCEMENTS, label: "Manage Announcements" },
    { key: SuperAdminPermission.VIEW_ANALYTICS, label: "View Analytics" },
    { key: SuperAdminPermission.MANAGE_SETTINGS, label: "Manage Settings" },
    { key: SuperAdminPermission.MANAGE_PERMISSIONS, label: "Manage Permissions" },
    { key: SuperAdminPermission.BULK_OPERATIONS, label: "Bulk Operations" },
    { key: SuperAdminPermission.DELETE_DATA, label: "Delete Data" },
  ];
}
