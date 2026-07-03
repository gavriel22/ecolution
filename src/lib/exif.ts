/**
 * EXIF metadata extractor using exifr.
 * Works on Node.js with Buffer/ArrayBuffer inputs.
 * exifr docs: https://github.com/MikeKovarik/exifr
 */
import exifr from "exifr";

export interface ExifResult {
  /** GPS latitude in decimal degrees (positive = North) */
  latitude: number | null;
  /** GPS longitude in decimal degrees (positive = East) */
  longitude: number | null;
  /** When the photo was originally taken (EXIF DateTimeOriginal) */
  takenAt: Date | null;
  /** True when at least GPS or takenAt was found */
  hasExif: boolean;
}

/**
 * Extract GPS and DateTime EXIF metadata from a Buffer or ArrayBuffer.
 *
 * @param buffer - Raw image bytes (JPEG/HEIC/TIFF supported by exifr)
 * @returns Parsed EXIF fields, or nulls if tags are absent.
 */
export async function extractExif(buffer: Buffer | ArrayBuffer): Promise<ExifResult> {
  try {
    // Only parse the tags we care about — faster than full parse
    const parsed = await exifr.parse(buffer, {
      pick: ["GPSLatitude", "GPSLongitude", "GPSLatitudeRef", "GPSLongitudeRef", "DateTimeOriginal", "CreateDate"],
      translateValues: true,
    });

    if (!parsed) {
      return { latitude: null, longitude: null, takenAt: null, hasExif: false };
    }

    // exifr already converts GPS refs and returns decimal degrees when translateValues=true
    const latitude: number | null =
      typeof parsed.latitude === "number" ? parsed.latitude : null;
    const longitude: number | null =
      typeof parsed.longitude === "number" ? parsed.longitude : null;

    // DateTimeOriginal takes priority over CreateDate
    const rawDate: Date | string | null =
      parsed.DateTimeOriginal ?? parsed.CreateDate ?? null;

    let takenAt: Date | null = null;
    if (rawDate) {
      const d = rawDate instanceof Date ? rawDate : new Date(rawDate);
      takenAt = isNaN(d.getTime()) ? null : d;
    }

    const hasExif = latitude !== null || longitude !== null || takenAt !== null;

    return { latitude, longitude, takenAt, hasExif };
  } catch {
    // exifr throws if the file is not a valid image or has no APP1 segment
    return { latitude: null, longitude: null, takenAt: null, hasExif: false };
  }
}
