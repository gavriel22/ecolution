import { NextRequest } from "next/server";
import { activityService } from "@/services/activity.service";
import { successResponse, errorResponse } from "@/utils/response";
import { verifyAccessToken } from "@/lib/jwt";
import { UnauthorizedError } from "@/utils/errors";
import { UserRole } from "@prisma/client";

async function getAuthContext(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    throw new UnauthorizedError("Token missing or invalid");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    throw new UnauthorizedError("Token missing or invalid");
  }

  const token = parts[1];
  const payload = await verifyAccessToken(token);
  if (!payload) {
    throw new UnauthorizedError("Token missing or invalid");
  }

  return {
    id: payload.id,
    email: payload.email,
    role: payload.role as UserRole,
    username: payload.username,
  };
}

/**
 * PUT /api/activity/categories/[id]
 * Update activity category (Admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthContext(req);
    const body = await req.json();
    const result = await activityService.updateCategory(id, user.role, body);
    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/activity/categories/[id]
 * Delete activity category (Admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthContext(req);
    const result = await activityService.deleteCategory(id, user.role);
    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
