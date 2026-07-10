import { NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/response";

export async function POST(req: NextRequest) {
  try {
    // Read refresh token from HttpOnly cookie
    const refreshToken = req.cookies.get("refresh_token")?.value;

    // Revoke the refresh token in the DB if we have one. Logout is idempotent:
    // even without a token we still clear cookies and return success so the
    // client always ends up in a clean, logged-out state.
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // Token already gone/invalid — proceed to clear cookies anyway.
      }
    }

    const response = successResponse({ message: "Successfully logged out" }, 200);

    const expire = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      maxAge: 0,
    };

    // Clear the refresh token at the current path ("/") and the legacy path
    // ("/api/auth") so sessions created before this change are also cleared.
    response.cookies.set("refresh_token", "", { ...expire, path: "/" });
    response.cookies.set("refresh_token", "", { ...expire, path: "/api/auth" });

    // Clear the access token cookie so the middleware stops treating the user
    // as authenticated on the next page load / hard refresh.
    response.cookies.set("accessToken", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
