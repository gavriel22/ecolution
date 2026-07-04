import { NextRequest } from "next/server";
import { challengeService } from "@/services/challenge.service";
import { successResponse, errorResponse } from "@/utils/response";

/**
 * GET /api/challenge/categories
 * List all challenge categories
 */
export async function GET(req: NextRequest) {
  try {
    const result = await challengeService.listChallengeCategories();
    return successResponse(result, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
