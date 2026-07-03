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
    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
