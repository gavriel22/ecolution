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

    const result = await challengeService.listChallenges({ categoryId, search });
    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
