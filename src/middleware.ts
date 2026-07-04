import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { UserRole } from "@prisma/client";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtected =
    path.startsWith("/admin") ||
    path.startsWith("/merchant") ||
    path.startsWith("/dashboard") ||
    path.startsWith("/api/auth/me") ||
    path.startsWith("/api/activity");

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

  console.log("PATH:", req.nextUrl.pathname);
  console.log("AUTH:", authHeader);
  console.log("TOKEN:", token);
  console.log("PAYLOAD:", payload);

  if (!payload) {
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Token missing or invalid" } },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (path.startsWith("/admin") && payload.role !== UserRole.ADMIN) {
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Forbidden" } },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (path.startsWith("/merchant") && payload.role !== UserRole.UMKM && payload.role !== UserRole.ADMIN) {
    if (path.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Forbidden" } },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.id);
  requestHeaders.set("x-user-email", payload.email);
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-username", payload.username);

  console.log("[MIDDLEWARE] Injected headers: x-user-id =", payload.id, "x-user-role =", payload.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/merchant/:path*",
    "/dashboard/:path*",
    "/api/auth/me",
    "/api/activity",
    "/api/activity/:path*",
  ],
};
