import { NextRequest } from "next/server";
import { voucherRedemptionService } from "@/services/voucher-redemption.service";
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
 * GET /api/reward/history
 * Fetch list of redemptions for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthContext(req);
    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    const result = await voucherRedemptionService.listUserRedemptions(user.id, { page, limit });
    return successResponse(result.redemptions, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}
