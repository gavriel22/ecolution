import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/response";
import { UnauthorizedError, ValidationError } from "@/utils/errors";
import { compressImage } from "@/lib/image";
import { saveUpload } from "@/lib/storage";

// Accept common profile-picture formats (unlike activity photos, no EXIF needed).
const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/auth/avatar
 * Uploads a profile picture file and returns its public URL.
 * The URL is then persisted via PUT /api/auth/me (profileImageUrl).
 */
export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth check ─────────────────────────────────────────────────────
    const userId = req.headers.get("x-user-id");
    console.log("[AVATAR:AUTH] x-user-id header:", userId);
    if (!userId) {
      console.error("[AVATAR:AUTH] Missing x-user-id header — middleware may not be injecting it for this route");
      throw new UnauthorizedError("User is not authenticated");
    }

    // ── 2. Parse form data ────────────────────────────────────────────────
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file || typeof file === "string") {
      throw new ValidationError("Field 'image' (file) wajib diisi");
    }

    console.log("[AVATAR:FILE] name:", file.name, "type:", file.type, "size:", file.size);

    if (!ALLOWED_MIME.has(file.type)) {
      throw new ValidationError(
        `Tipe file tidak didukung: ${file.type || "tidak diketahui"}. Gunakan JPG, PNG, WEBP, atau GIF.`
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new ValidationError(
        `Ukuran file maksimum 5 MB (dikirim: ${(file.size / 1024 / 1024).toFixed(1)} MB)`
      );
    }

    // ── 3. Compress ───────────────────────────────────────────────────────
    const original = Buffer.from(await file.arrayBuffer());
    console.log("[AVATAR:COMPRESS] Starting compression, original size:", original.length);

    const compressed = await compressImage(original, { maxSize: 512, quality: 80 });
    console.log("[AVATAR:COMPRESS] Done, compressed size:", compressed.buffer.length, "ext:", compressed.ext);

    // ── 4. Upload to storage ──────────────────────────────────────────────
    const filename = `${userId}-${Date.now()}${compressed.ext}`;
    console.log("[AVATAR:UPLOAD] Uploading to storage, key: avatars/" + filename);

    const url = await saveUpload("avatars", filename, compressed.buffer, compressed.contentType);
    console.log("[AVATAR:UPLOAD] Success, URL:", url);

    return successResponse({ url }, 201);
  } catch (error) {
    console.error("[AVATAR:ERROR]", error instanceof Error ? error.stack : error);
    return errorResponse(error);
  }
}
