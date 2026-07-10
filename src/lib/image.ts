import sharp from "sharp";

export interface CompressOptions {
  /** Longest-edge cap in px (image is scaled to fit, never enlarged). */
  maxSize?: number;
  /** JPEG quality 1–100. */
  quality?: number;
  /** Extension to fall back to if compression fails (keeps original bytes). */
  fallbackExt?: string;
}

export interface CompressedImage {
  buffer: Buffer;
  /** File extension including the dot, e.g. ".jpg". */
  ext: string;
  contentType: string;
}

/**
 * Compresses & normalizes an uploaded image for storage.
 *
 * - Re-encodes to JPEG (so HEIC/TIFF/PNG/WebP all become browser-displayable —
 *   HEIC from iPhones otherwise won't render in Chrome/Firefox/Android).
 * - Auto-orients from EXIF orientation, then bakes it in (`.rotate()`).
 * - Downscales to `maxSize` on the longest edge and drops metadata, which
 *   dramatically shrinks large phone photos.
 *
 * IMPORTANT: EXIF must be extracted from the ORIGINAL buffer BEFORE calling this
 * — sharp strips metadata on output. Callers that need EXIF (activity photos)
 * already persist it to the DB beforehand.
 *
 * Never throws: on any failure it returns the original bytes so an upload is
 * never lost just because compression hiccuped.
 */
export async function compressImage(
  input: Buffer,
  opts: CompressOptions = {}
): Promise<CompressedImage> {
  const maxSize = opts.maxSize ?? 1600;
  const quality = opts.quality ?? 72;

  try {
    const buffer = await sharp(input, { failOn: "none" })
      .rotate() // auto-orient using EXIF, then strip orientation
      .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    return { buffer, ext: ".jpg", contentType: "image/jpeg" };
  } catch (err) {
    console.warn("[image] compression failed, storing original bytes:", err);
    return {
      buffer: input,
      ext: opts.fallbackExt ?? ".jpg",
      contentType: "application/octet-stream",
    };
  }
}
