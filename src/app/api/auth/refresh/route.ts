import { NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await authService.refresh(body.refreshToken);
    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
