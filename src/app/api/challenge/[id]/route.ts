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
