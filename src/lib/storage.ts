import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

/**
 * Portable image storage.
 *
 * - Vercel (BLOB_READ_WRITE_TOKEN tersedia):
 *   Upload ke Vercel Blob dan mengembalikan URL publik.
 *
 * - Local Development:
 *   Simpan ke public/uploads agar tetap bisa digunakan saat development.
 */
export async function saveUpload(
  folder: string,
  filename: string,
  buffer: Buffer,
  contentType = "image/jpeg"
): Promise<string> {
  const key = `${folder}/${filename}`;

  // Production / Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });

    return blob.url;
  }

  // Local development fallback
  const dir = path.join(process.cwd(), "public", "uploads", folder);

  await fs.mkdir(dir, { recursive: true });

  await fs.writeFile(path.join(dir, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}