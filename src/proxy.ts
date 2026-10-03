import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "@/types/entities.types";
import { getAllowedRolesForPath, ROLE_DEFAULT_REDIRECT } from "@/config/roles";
import { ROUTES } from "@/config/routes";

const REFRESH_COOKIE_NAME = "ambulance_refresh_token";
const ROLE_COOKIE_NAME = "ambulance_auth_role";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_COOKIE_NAME);
  const role = request.cookies.get(ROLE_COOKIE_NAME)?.value as Role | undefined;

  const isAuthRoute =
    pathname.startsWith(ROUTES.AUTH.LOGIN) ||
    pathname.startsWith(ROUTES.AUTH.REGISTER);

  // 1. If authenticated user attempts to access /login or /register, redirect to dashboard
  if (isAuthRoute) {
    if (hasSession && role && ROLE_DEFAULT_REDIRECT[role]) {
      return NextResponse.redirect(
        new URL(ROLE_DEFAULT_REDIRECT[role], request.url),
      );
    }
    return NextResponse.next();
  }

  // 2. Check if route is protected
  const allowedRoles = getAllowedRolesForPath(pathname);
  if (!allowedRoles) {
    // Public route — allow access
    return NextResponse.next();
  }

  // 3. Protected route: verify active session cookie exists
  if (!hasSession) {
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Verify user role permissions for this protected area
  if (!role || !allowedRoles.includes(role)) {
    // If user has a valid role but wrong portal, redirect to their designated dashboard
    if (role && ROLE_DEFAULT_REDIRECT[role]) {
      return NextResponse.redirect(
        new URL(ROLE_DEFAULT_REDIRECT[role], request.url),
      );
    }
    // Fallback: login
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/patient",
    "/patient/:path*",
    "/driver",
    "/driver/:path*",
    "/admin",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
