import { NextRequest } from "next/server";
import { activityUploadService } from "@/services/activity-upload.service";
import { activityService } from "@/services/activity.service";
import { successResponse, errorResponse } from "@/utils/response";
import { getPaginationParams } from "@/utils/pagination";
import { UnauthorizedError } from "@/utils/errors";

/**
 * GET /api/activity
 * Ambil daftar aktivitas milik user (atau semua jika ADMIN).
 * Mendukung pagination, filter status/kategori, dan search.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || "";
    const userRole = req.headers.get("x-user-role") || "USER";

    const { searchParams } = new URL(req.url);
    const { page, limit } = getPaginationParams(searchParams);

    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const status = searchParams.get("status") || undefined;
    const sortBy = searchParams.get("sortBy") || undefined;
    const sortOrderParam = searchParams.get("sortOrder");
    const sortOrder =
      sortOrderParam === "asc" || sortOrderParam === "desc"
        ? sortOrderParam
        : undefined;

    const queryUserId = searchParams.get("userId");
    const targetUserId =
      userRole === "ADMIN" ? queryUserId || undefined : userId;

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

/**
 * POST /api/activity
 * Upload foto aktivitas (multipart/form-data).
 * Mengekstrak metadata EXIF (GPS + waktu) dari gambar.
 * Jika EXIF tidak ditemukan → Activity disimpan dengan status REJECTED.
 *
 * Form fields:
 *   image        File    - Foto aktivitas (JPEG/HEIC/TIFF, maks 10 MB)
 *   title        string  - Judul aktivitas (min 3 karakter)
 *   description  string? - Deskripsi opsional
 *   categoryId   string  - UUID kategori aktivitas
 *   activityDate string  - Tanggal aktivitas (ISO 8601)
 *   location     string? - Lokasi teks opsional
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    console.log("[ACTIVITY:AUTH] x-user-id header:", userId);
    if (!userId) {
      console.error("[ACTIVITY:AUTH] Missing x-user-id — middleware did not inject auth headers");
      throw new UnauthorizedError("User is not authenticated");
    }

    // Next.js App Router mendukung formData() langsung dari request
    console.log("[ACTIVITY:UPLOAD] Parsing form data...");
    const formData = await req.formData();
    console.log("[ACTIVITY:UPLOAD] Form data parsed, calling uploadActivity service...");

    const result = await activityUploadService.uploadActivity(userId, formData);
    console.log("[ACTIVITY:UPLOAD] Success, activity ID:", result.id);

    return successResponse(result, 201);
  } catch (error) {
    console.error("[ACTIVITY:ERROR]", error instanceof Error ? error.stack : error);
    return errorResponse(error);
  }
}

