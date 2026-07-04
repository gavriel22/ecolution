import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/response";
import { rateLimit } from "@/lib/rate-limit";

// 5 attempts per 15 minutes per IP
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SEC = 15 * 60;

export async function POST(req: NextRequest) {
  try {
    // --- Rate limiting ---
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const rl = rateLimit(`login:${ip}`, {
      limit: RATE_LIMIT_MAX,
      windowSec: RATE_LIMIT_WINDOW_SEC,
    });

    if (!rl.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOO_MANY_REQUESTS",
            message: `Too many login attempts. Try again after ${new Date(rl.resetAt).toISOString()}.`,
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
          },
        }
      );
    }

    // --- Auth ---
    const body = await req.json();
    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = ip !== "unknown" ? ip : undefined;

    const result = await authService.login(
      {
        email: body.email,
        password: body.password,
      },
      {
        deviceName: body.deviceName,
        ipAddress,
        userAgent,
      }
    );

    // --- Set refresh token as HttpOnly cookie ---
    const response = successResponse({ user: result.user, accessToken: result.accessToken }, 200);

    response.cookies.set("refresh_token", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",          // hanya dikirim ke endpoint auth
      maxAge: 60 * 60 * 24 * 30, // 30 hari (sesuai expiry di DB)
    });

    // Set accessToken cookie for middleware to read on page navigations
    response.cookies.set("accessToken", result.accessToken, {
      httpOnly: false, // Allow client to read if needed, or true if strict
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour (sesuai expiry token)
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
