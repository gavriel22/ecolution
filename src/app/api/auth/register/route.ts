import { NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await authService.register({
      name: body.name,
      username: body.username,
      email: body.email,
      password: body.password,
      role: body.role,
    });
    return successResponse(user, 201);
  } catch (error) {
    return errorResponse(error);
  }
}