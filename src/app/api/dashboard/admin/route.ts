import { NextRequest } from "next/server";
import { dashboardService } from "@/services/dashboard.service";
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
 * GET /api/dashboard/admin
 * Retrieve administrator dashboard analytics
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthContext(req);
    const result = await dashboardService.getAdminDashboard(user.role);
    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
