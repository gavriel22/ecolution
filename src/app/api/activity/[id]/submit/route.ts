import { NextRequest } from "next/server";
import { activityService } from "@/services/activity.service";
import { successResponse, errorResponse } from "@/utils/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id") || "";

    const activity = await activityService.submitActivity(id, userId);
    return successResponse(activity, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
