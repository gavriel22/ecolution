import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/response";
import { UnauthorizedError } from "@/utils/errors";

export async function POST(req: NextRequest) {
  try {
    // Read refresh token from HttpOnly cookie (not body)
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token missing");
    }

    const result = await authService.refresh(refreshToken);
    const response = successResponse(result, 200);

    // Set accessToken cookie for middleware to read on page navigations
    response.cookies.set("accessToken", result.accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15, // 15 minutes (matches access-token JWT expiry)
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
