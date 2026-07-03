import { NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await authService.logout(body.refreshToken);
    return successResponse({ message: "Successfully logged out" }, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
