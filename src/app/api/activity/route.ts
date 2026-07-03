import { NextRequest } from "next/server";
import { activityService } from "@/services/activity.service";
import { successResponse, errorResponse } from "@/utils/response";
import { getPaginationParams } from "@/utils/pagination";

export async function GET(req: NextRequest) {
  try {
    const loggedInUserId = req.headers.get("x-user-id") || "";
    const userRole = req.headers.get("x-user-role") || "USER";

    const { searchParams } = new URL(req.url);
    const { page, limit } = getPaginationParams(searchParams);

    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const status = searchParams.get("status") || undefined;
    const sortBy = searchParams.get("sortBy") || undefined;
    const sortOrderParam = searchParams.get("sortOrder");
    const sortOrder = sortOrderParam === "asc" || sortOrderParam === "desc" ? sortOrderParam : undefined;

    const queryUserId = searchParams.get("userId");
    const targetUserId = userRole === "ADMIN" ? (queryUserId || undefined) : loggedInUserId;

    const result = await activityService.listActivities({
      page,
      limit,
      search,
      categoryId,
      status,
      userId: targetUserId,
      userRole,
      sortBy,
      sortOrder,
    });

    return successResponse(result.activities, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || "";
    const body = await req.json();
    const activity = await activityService.createActivity(userId, body);
    return successResponse(activity, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
