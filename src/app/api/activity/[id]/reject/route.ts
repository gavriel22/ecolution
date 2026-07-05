import { NextRequest } from "next/server";
import { activityService } from "@/services/activity.service";
import { successResponse, errorResponse } from "@/utils/response";
import { ForbiddenError, UnauthorizedError } from "@/utils/errors";
import { verifyAccessToken } from "@/lib/jwt";
import { UserRole } from "@prisma/client";

async function getAuthContext(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  let token = "";
  if (authHeader) {
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
      token = parts[1];
    }
  }

  if (!token) {
    token = req.cookies.get("accessToken")?.value || "";
  }

  if (!token) {
    throw new UnauthorizedError("Token missing or invalid");
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    throw new UnauthorizedError("Token missing or invalid");
  }

  return {
    id: payload.id,
    role: payload.role as UserRole,
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthContext(req);

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenError("Only admins can reject activities");
    }

    const body = await req.json();
    const activity = await activityService.rejectActivity(id, user.id, body.adminNote, body.note);
    return successResponse(activity, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
