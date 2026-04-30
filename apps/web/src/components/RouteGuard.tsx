"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const roleRouteMap: Record<UserRole, string> = {
  superAdmin: "/super-admin",
  principal: "/principal",
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
  parent: "/parent",
};

interface RouteGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RouteGuard({ allowedRoles, children, fallback }: RouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user && !allowedRoles.includes(user.role)) {
      const allowedPrefix = roleRouteMap[user.role];
      if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
        router.replace(allowedPrefix);
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback ?? null;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return fallback ?? (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}

export function useRouteGuard(allowedRoles: UserRole[]) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user && !allowedRoles.includes(user.role)) {
      const allowedPrefix = roleRouteMap[user.role];
      if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
        router.replace(allowedPrefix);
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, pathname]);

  return { isLoading, isAllowed: isAuthenticated && !!user && allowedRoles.includes(user.role) };
}
