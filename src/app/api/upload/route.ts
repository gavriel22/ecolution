import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/response";
import { UnauthorizedError, ValidationError } from "@/utils/errors";
import { compressImage } from "@/lib/image";
import { saveUpload } from "@/lib/storage";

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Only these destination folders are allowed (prevents path traversal).
const ALLOWED_FOLDERS = new Set(["products", "merchants", "misc"]);

/**
 * POST /api/upload
 * Generic authenticated image upload used by UMKM (product photos, store logos).
 * Compresses to JPEG and returns the public URL to store on the entity.
 *
 * Form fields:
 *   image   File    - the picture
 *   folder  string? - destination bucket (products | merchants | misc)
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    console.log("[UPLOAD:AUTH] x-user-id header:", userId);
    if (!userId) {
      console.error("[UPLOAD:AUTH] Missing x-user-id — middleware did not inject auth headers");
      throw new UnauthorizedError("User is not authenticated");
    }

    const formData = await req.formData();
    const file = formData.get("image");
    const folderRaw = (formData.get("folder") as string | null)?.trim() || "misc";
    const folder = ALLOWED_FOLDERS.has(folderRaw) ? folderRaw : "misc";

    if (!file || typeof file === "string") {
      throw new ValidationError("Field 'image' (file) wajib diisi");
    }

    console.log("[UPLOAD:FILE] name:", file.name, "type:", file.type, "size:", file.size, "folder:", folder);

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
    console.log("[UPLOAD:COMPRESS] Starting compression, original size:", original.length);

    const compressed = await compressImage(original, { maxSize: 1200, quality: 78 });
    console.log("[UPLOAD:COMPRESS] Done, compressed size:", compressed.buffer.length);

    const filename = `${userId}-${Date.now()}${compressed.ext}`;
    console.log("[UPLOAD:STORAGE] Uploading to storage, key:", folder + "/" + filename);

    const url = await saveUpload(folder, filename, compressed.buffer, compressed.contentType);
    console.log("[UPLOAD:STORAGE] Success, URL:", url);

    return successResponse({ url }, 201);
  } catch (error) {
    console.error("[UPLOAD:ERROR]", error instanceof Error ? error.stack : error);
    return errorResponse(error);
  }
}

