import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("acadivo-tokens")?.value;
  const userCookie = request.cookies.get("acadivo-user")?.value;
  const pathname = request.nextUrl.pathname;

  // Public routes that don't need auth
  const publicRoutes = ["/login", "/forgot-password", "/reset-password", "/verify-otp", "/"];
  if (publicRoutes.some((r) => pathname.startsWith(r))) return NextResponse.next();

  // Static assets and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/static/") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // No token = redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based route protection
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      const role = user.role;
      const roleRouteMap: Record<string, string> = {
        superAdmin: "/super-admin",
        principal: "/principal",
        admin: "/admin",
        teacher: "/teacher",
        student: "/student",
        parent: "/parent",
      };

      // Check if user is accessing their allowed routes
      const allowedPrefix = roleRouteMap[role];
      if (
        allowedPrefix &&
        !pathname.startsWith(allowedPrefix) &&
        !pathname.startsWith("/api")
      ) {
        return NextResponse.redirect(new URL(allowedPrefix + "/dashboard", request.url));
      }
    } catch {
      /* invalid cookie */
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
