import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Role } from "@/types/entities.types";
import type { ApiResponse } from "@/types/api.types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ambulance-dispatch-backend-66f2.onrender.com/api/v1";

const REFRESH_COOKIE_NAME = "ambulance_refresh_token";
const ROLE_COOKIE_NAME = "ambulance_auth_role";

// 7 days in seconds
const MAX_AGE = 7 * 24 * 60 * 60;

/**
 * POST /api/auth/session
 * Server-sets HTTP-only refresh token cookie and role cookie upon successful login/register
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken, role } = body as {
      refreshToken?: string;
      role?: Role;
    };

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Missing refresh token" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();

    // Set HTTP-only, secure, SameSite=Lax cookie for refresh token
    cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
    });

    // Set role cookie for Next.js proxy route protection
    if (role) {
      cookieStore.set(ROLE_COOKIE_NAME, role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: MAX_AGE,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Session cookies established",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to establish session" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/auth/session
 * Server reads the HTTP-only cookie and exchanges it with Express backend for a new access token
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;
    const role = cookieStore.get(ROLE_COOKIE_NAME)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: true,
          authenticated: false,
          accessToken: null,
          message: "No active session cookie found",
        },
        { status: 200 },
      );
    }

    // Call Express backend refresh token endpoint
    const backendRes = await fetch(`${BACKEND_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!backendRes.ok) {
      // Refresh token expired or revoked — clear invalid cookies
      cookieStore.delete(REFRESH_COOKIE_NAME);
      cookieStore.delete(ROLE_COOKIE_NAME);
      return NextResponse.json(
        {
          success: true,
          authenticated: false,
          accessToken: null,
          message: "Session expired or revoked",
        },
        { status: 200 },
      );
    }

    const data = (await backendRes.json()) as ApiResponse<{
      accessToken: string;
    }>;

    return NextResponse.json({
      success: true,
      accessToken: data.data.accessToken,
      role: role as Role | undefined,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to refresh session" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/auth/session
 * Clears HTTP-only cookies on logout
 */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_COOKIE_NAME);
  cookieStore.delete(ROLE_COOKIE_NAME);

  return NextResponse.json({
    success: true,
    message: "Session cookies cleared",
  });
}
