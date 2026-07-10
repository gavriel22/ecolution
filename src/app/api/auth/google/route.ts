import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/response";

/**
 * GET /api/auth/google
 * Exposes the Google Client ID to the client-side without NEXT_PUBLIC prefix requirement.
 */
export async function GET() {
  return successResponse({ clientId: process.env.GOOGLE_CLIENT_ID || null }, 200);
}

/**
 * POST /api/auth/google
 * Authenticates user using Google ID Token, registers if new, and issues JWT cookies.
 */
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const body = await req.json();
    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = ip !== "unknown" ? ip : undefined;

    const result = await authService.loginWithGoogle(body.idToken, {
      deviceName: body.deviceName,
      ipAddress,
      userAgent,
    });

    // Set refresh token and access token cookies, identical to normal login
    const response = successResponse({ user: result.user, accessToken: result.accessToken }, 200);

    response.cookies.set("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    response.cookies.set("accessToken", result.accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
