import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin role protection
    if (path.startsWith("/admin") && token?.role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Merchant (UMKM) role protection
    if (path.startsWith("/merchant") && token?.role !== UserRole.UMKM && token?.role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/merchant/:path*",
    "/dashboard/:path*",
    "/api/admin/:path*",
  ],
};
