import { NextRequest } from "next/server";
import { activityService } from "@/services/activity.service";
import { successResponse, errorResponse } from "@/utils/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id") || "";
    const userRole = req.headers.get("x-user-role") || "USER";

    const activity = await activityService.getDetail(id, userId, userRole);
    return successResponse(activity, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id") || "";
    const userRole = req.headers.get("x-user-role") || "USER";
    const body = await req.json();

    const activity = await activityService.updateActivity(id, userId, userRole, body);
    return successResponse(activity, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id") || "";
    const userRole = req.headers.get("x-user-role") || "USER";

    await activityService.deleteActivity(id, userId, userRole);
    return successResponse({ message: "Activity deleted successfully" }, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
