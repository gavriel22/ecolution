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
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenError("Only administrators can view all users");
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        trustScore: true,
        totalPoint: true,
        isActive: true,
        createdAt: true,
      },
    });

    return successResponse({ users });
  } catch (error) {
    return errorResponse(error);
  }
}
