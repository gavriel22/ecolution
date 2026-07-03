import { NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = req.headers.get("x-forwarded-for") || undefined;

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

    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
