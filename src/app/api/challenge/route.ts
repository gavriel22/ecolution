import { NextRequest } from "next/server";
import { challengeService } from "@/services/challenge.service";
import { successResponse, errorResponse } from "@/utils/response";

/**
 * GET /api/challenge
 * List all active challenges
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const search = searchParams.get("search") || undefined;

    // Check if user is Admin, if so, allow listing all status challenges
    const authHeader = req.headers.get("authorization");
    let userRole: UserRole = UserRole.USER;
    if (authHeader) {
      try {
        const parts = authHeader.split(" ");
        if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
          const payload = await verifyAccessToken(parts[1]);
          if (payload) userRole = payload.role as UserRole;
        }
      } catch {}
    }

    const result = userRole === UserRole.ADMIN
      ? await challengeService.listAllChallengesAdmin(userRole)
      : await challengeService.listChallenges({ categoryId, search });

    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/challenge
 * Create new challenge (Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthContext(req);
    const body = await req.json();
    const result = await challengeService.createChallenge(user.role, body);
    return successResponse(result, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

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
