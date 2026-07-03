import { NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/response";
import { UnauthorizedError } from "@/utils/errors";

export async function POST(req: NextRequest) {
  try {
    // Read refresh token from HttpOnly cookie
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      throw new UnauthorizedError("Already logged out or refresh token missing");
    }

    await authService.logout(refreshToken);

    const response = successResponse({ message: "Successfully logged out" }, 200);

    // Clear the HttpOnly cookie
    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
