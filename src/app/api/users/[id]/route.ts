import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/response";
import { verifyAccessToken } from "@/lib/jwt";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "@/utils/errors";
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthContext(req);
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenError("Only administrators can update user profiles");
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      throw new NotFoundError("User not found");
    }

    const body = await req.json();
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: body.role ?? undefined,
        isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
      },
    });

    return successResponse({ user: updatedUser });
  } catch (error) {
    return errorResponse(error);
  }
}
