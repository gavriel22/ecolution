import { NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/response";
import { UnauthorizedError } from "@/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");
    console.log("[ROUTE /api/auth/me] Header x-user-id received:", userId);
    console.log("[ROUTE /api/auth/me] Header x-user-role received:", userRole);

    if (!userId) {
      throw new UnauthorizedError("User is not authenticated");
    }
    const user = await authService.me(userId);
    return successResponse(user, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      throw new UnauthorizedError("User is not authenticated");
    }

    const body = await req.json();
    const updatedUser = await authService.updateProfile(userId, {
      name: body.name,
      username: body.username,
      email: body.email,
      phone: body.phone,
      profileImageUrl: body.profileImageUrl,
      bio: body.bio,
      address: body.address,
    });
    return successResponse(updatedUser, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
