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
 * GET /api/merchant/[id]
 * Get merchant details (only owner, admin, or approved merchants are viewable)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthContext(req);
    const result = await merchantService.getMerchant(id, user.id, user.role);
    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PUT /api/merchant/[id]
 * Updates a merchant (only owner)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthContext(req);
    const body = await req.json();
    const result = await merchantService.updateMerchant(id, user.id, user.role, body);
    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/merchant/[id]
 * Deletes a merchant (only owner, cannot delete if has products)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthContext(req);
    await merchantService.deleteMerchant(id, user.id, user.role);
    return successResponse({ message: "Merchant deleted successfully" }, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
