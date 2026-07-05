import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/response";
import { verifyAccessToken } from "@/lib/jwt";
import { UnauthorizedError, ForbiddenError } from "@/utils/errors";
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

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthContext(req);
    if (user.role !== UserRole.UMKM && user.role !== UserRole.ADMIN) {
      throw new ForbiddenError("Only merchants or admins can view merchant orders");
    }

    const merchant = await prisma.merchant.findUnique({
      where: { ownerId: user.id },
    });

    if (!merchant) {
      return successResponse({ orders: [] });
    }

    // Find orders that contain items from this merchant
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              merchantId: merchant.id,
            },
          },
        },
      },
      include: {
        items: {
          where: {
            product: {
              merchantId: merchant.id,
            },
          },
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse({ orders });
  } catch (error) {
    return errorResponse(error);
  }
}
