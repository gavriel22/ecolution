import { NextRequest } from "next/server";
import { activityService } from "@/services/activity.service";
import { successResponse, errorResponse } from "@/utils/response";
import { ForbiddenError } from "@/utils/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminId = req.headers.get("x-user-id") || "";
    const role = req.headers.get("x-user-role");

    if (role !== "ADMIN") {
      throw new ForbiddenError("Only admins can reject activities");
    }

    const body = await req.json();
    const activity = await activityService.rejectActivity(id, adminId, body.adminNote, body.note);
    return successResponse(activity, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
