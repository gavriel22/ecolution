import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

/**
 * Portable image storage.
 *
 * - Vercel (BLOB_READ_WRITE_TOKEN atau OIDC via BLOB_STORE_ID):
 *   Upload ke Vercel Blob dan mengembalikan URL publik.
 *   SDK @vercel/blob secara otomatis mendeteksi autentikasi:
 *     • BLOB_READ_WRITE_TOKEN — token statis (legacy / local dev)
 *     • BLOB_STORE_ID + VERCEL_OIDC_TOKEN — OIDC rotasi otomatis (production Vercel)
 *
 * - Local Development (tanpa token/store ID):
 *   Simpan ke public/uploads agar tetap bisa digunakan saat development.
 */
export async function saveUpload(
  folder: string,
  filename: string,
  buffer: Buffer,
  contentType = "image/jpeg"
): Promise<string> {
  const key = `${folder}/${filename}`;

  // Production / Vercel Blob (Menggunakan token atau OIDC / BLOB_STORE_ID di Vercel)
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
    console.log("[STORAGE] Using Vercel Blob for key:", key);
    console.log("[STORAGE] Auth method:", process.env.BLOB_READ_WRITE_TOKEN ? "BLOB_READ_WRITE_TOKEN" : "OIDC (BLOB_STORE_ID)");

    try {
      const blob = await put(key, buffer, {
        access: "public",
        contentType,
        addRandomSuffix: false,
      });

      console.log("[STORAGE] Blob uploaded successfully, URL:", blob.url);
      return blob.url;
    } catch (error) {
      console.error("[STORAGE] Vercel Blob upload FAILED for key:", key);
      console.error("[STORAGE] Error:", error instanceof Error ? error.message : error);
      console.error("[STORAGE] Stack:", error instanceof Error ? error.stack : "N/A");
      throw error;
    }
  }

  // Local development fallback
  console.log("[STORAGE] Using local filesystem fallback for key:", key);
  const dir = path.join(process.cwd(), "public", "uploads", folder);

  await fs.mkdir(dir, { recursive: true });

  await fs.writeFile(path.join(dir, filename), buffer);

  const localUrl = `/uploads/${folder}/${filename}`;
  console.log("[STORAGE] Local file saved, URL:", localUrl);
  return localUrl;
}