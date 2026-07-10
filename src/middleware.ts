import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, verifyRefreshToken, generateAccessToken } from "@/lib/jwt";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtected =
    path.startsWith("/admin") ||
    path.startsWith("/dashboard") ||
    path.startsWith("/api/auth/me") ||
    path.startsWith("/api/activity") ||
    path.startsWith("/merchant/products") ||
    path.startsWith("/merchant/orders") ||
    path.startsWith("/merchant/statistics") ||
    path.startsWith("/merchant/profile") ||
    path.startsWith("/merchant/register");

  if (!isProtected) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  let token: string | null = null;
  let payload: any = null;

  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
      token = parts[1];
    }
  }

  if (!token) {
    token = req.cookies.get("accessToken")?.value || null;
  }

  if (token) {
    try {
      payload = await verifyAccessToken(token);
    } catch (e) {
      console.error("Token verification failed:", e);
    }
  }

  // Silent refresh at the edge: on a hard page refresh there is no Authorization
  // header, and the short-lived access token cookie (15m) may already be expired
  // even though the 30-day refresh token is still valid. Fall back to the refresh
  // token and mint a fresh access token so the user is NOT bounced to /login.
  let refreshedAccessToken: string | null = null;
  if (!payload) {
    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (refreshToken) {
      const refreshPayload = await verifyRefreshToken(refreshToken);
      if (refreshPayload) {
        payload = refreshPayload;
        refreshedAccessToken = await generateAccessToken({
          id: refreshPayload.id,
          email: refreshPayload.email,
          role: refreshPayload.role,
          username: refreshPayload.username,
        });
      }
    }
  }

  if (!payload) {
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Token missing or invalid" } },
        { status: 401 }
      );
    }
    const callbackUrl = req.nextUrl.pathname + req.nextUrl.search;
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  if (path.startsWith("/admin") && payload.role !== "ADMIN") {
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Forbidden" } },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  const isMerchantDashboardPath =
    path.startsWith("/merchant/products") ||
    path.startsWith("/merchant/orders") ||
    path.startsWith("/merchant/statistics") ||
    path.startsWith("/merchant/profile");

  if (isMerchantDashboardPath && payload.role !== "UMKM" && payload.role !== "ADMIN") {
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Forbidden" } },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/merchant/register", req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.id);
  requestHeaders.set("x-user-email", payload.email);
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-username", payload.username);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // If we minted a new access token from the refresh token, persist it so the
  // client and subsequent navigations pick it up (keeps the session alive).
  if (refreshedAccessToken) {
    response.cookies.set("accessToken", refreshedAccessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15, // 15 minutes, matches the JWT expiry
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/merchant/:path*",
    "/dashboard/:path*",
    "/api/auth/me",
    "/api/auth/avatar",
    "/api/upload",
    "/api/activity",
    "/api/activity/:path*",
  ],
};
