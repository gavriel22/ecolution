import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { successResponse, errorResponse } from "@/utils/response";
import { UnauthorizedError, ValidationError } from "@/utils/errors";
import { compressImage } from "@/lib/image";

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
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      throw new UnauthorizedError("User is not authenticated");
    }

    const formData = await req.formData();
    const file = formData.get("image");

    if (!file || typeof file === "string") {
      throw new ValidationError("Field 'image' (file) wajib diisi");
    }

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

    const original = Buffer.from(await file.arrayBuffer());

    // Compress & normalize to a small square-ish JPEG — avatars never need to
    // be large, and this keeps stored files tiny and fast to load.
    const compressed = await compressImage(original, { maxSize: 512, quality: 80 });

    // Persist under public/uploads/avatars so Next serves it statically.
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${userId}-${Date.now()}${compressed.ext}`;
    await fs.writeFile(path.join(uploadDir, filename), compressed.buffer);

    const url = `/uploads/avatars/${filename}`;
    return successResponse({ url }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
