import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/response";
import { verifyAccessToken } from "@/lib/jwt";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "@/utils/errors";
import { UserRole, MerchantStatus } from "@prisma/client";

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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthContext(req);
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenError("Only administrators can reject merchants");
    }

    const merchant = await prisma.merchant.findUnique({
      where: { id },
    });

    if (!merchant) {
      throw new NotFoundError("Merchant not found");
    }

    // Set status to SUSPENDED as rejection
    const updatedMerchant = await prisma.merchant.update({
      where: { id },
      data: {
        status: MerchantStatus.SUSPENDED,
      },
      include: {
        owner: true,
      },
    });

    return successResponse(updatedMerchant, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
