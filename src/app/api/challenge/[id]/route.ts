import { NextRequest } from "next/server";
import { challengeService } from "@/services/challenge.service";
import { successResponse, errorResponse } from "@/utils/response";
import { verifyAccessToken } from "@/lib/jwt";

async function getOptionalUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") return null;

  const token = parts[1];
  try {
    const payload = await verifyAccessToken(token);
    return payload ? payload.id : null;
  } catch {
    return null;
  }
}

/**
 * GET /api/challenge/[id]
 * Get details of a challenge (with optional progress if authenticated)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getOptionalUserId(req);

    const result = userId
      ? await challengeService.getChallengeWithUserProgress(id, userId)
      : await challengeService.getChallenge(id);

    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PUT /api/challenge/[id]
 * Update challenge (Admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthContext(req);
    const body = await req.json();
    const result = await challengeService.updateChallenge(id, user.role, body);
    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * DELETE /api/challenge/[id]
 * Delete challenge (Admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthContext(req);
    await challengeService.deleteChallenge(id, user.role);
    return successResponse({ message: "Challenge deleted successfully" }, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

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
