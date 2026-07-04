import { NextRequest } from "next/server";
import { merchantService } from "@/services/merchant.service";
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
 * GET /api/merchant
 * Lists merchants based on role (admins see all, others see only APPROVED)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthContext(req);
    const result = await merchantService.listMerchants(user.id, user.role);
    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/merchant
 * Registers a new merchant (default status: PENDING, isApproved: false)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthContext(req);
    const body = await req.json();
    const result = await merchantService.createMerchant(user.id, user.role, body);
    return successResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
