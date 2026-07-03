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
    const userRole = req.headers.get("x-user-role") || "USER";
    const body = await req.json();

    const photo = await activityService.addPhoto(id, userId, userRole, body.imageUrl);
    return successResponse(photo, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
