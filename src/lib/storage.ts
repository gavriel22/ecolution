import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

/**
 * Portable image storage.
 *
 * - On Vercel (or anywhere `BLOB_READ_WRITE_TOKEN` is set) → uploads to Vercel
 *   Blob and returns a public https URL. Vercel's filesystem is read-only, so
 *   writing to `public/uploads` there is impossible.
 * - On localhost / any writable host (no token) → writes to `public/uploads`
 *   and returns a relative `/uploads/...` path served statically by Next.
 *
 * Returned value is stored directly on the entity (activity photo, product,
 * avatar, merchant logo). Both forms fit in the existing VarChar(255) columns.
 */
export async function saveUpload(
  folder: string,
  filename: string,
  buffer: Buffer,
  contentType = "image/jpeg"
): Promise<string> {
  const key = `${folder}/${filename}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  // Local fallback (development / self-hosted with a writable disk).
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);
  return `/uploads/${folder}/${filename}`;
}
