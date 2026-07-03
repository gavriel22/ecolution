import { NextRequest } from "next/server";
import { activityService } from "@/services/activity.service";
import { successResponse, errorResponse } from "@/utils/response";

export async function GET(req: NextRequest) {
  try {
    const categories = await activityService.listCategories();
    return successResponse(categories, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
