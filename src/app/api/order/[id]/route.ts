import { NextRequest } from "next/server";
import { orderService } from "@/services/order.service";
import { successResponse, errorResponse } from "@/utils/response";
import { verifyAccessToken } from "@/lib/jwt";
import { UnauthorizedError, NotFoundError, ForbiddenError } from "@/utils/errors";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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
 * GET /api/order/[id]
 * Get order details by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthContext(req);
    const result = await orderService.getOrder(id, user.id, user.role);
    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PUT /api/order/[id]
 * Update order status (Admin, order owner, or merchant of the ordered items)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthContext(req);
    const body = await req.json();
    const { status } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return errorResponse(new NotFoundError("Order not found"));
    }

    // Check authorization: must be admin, order owner, or merchant
    const isOwner = order.userId === user.id;
    const isAdmin = user.role === UserRole.ADMIN;
    
    // Find if the user owns any merchant that has products in this order
    const userMerchant = await prisma.merchant.findUnique({
      where: { ownerId: user.id },
    });
    const isMerchant = userMerchant && order.items.some(
      (item) => item.product.merchantId === userMerchant.id
    );

    if (!isOwner && !isAdmin && !isMerchant) {
      return errorResponse(new ForbiddenError("You do not have permission to update this order"));
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
      },
    });

    return successResponse(updatedOrder, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
