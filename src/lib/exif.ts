/**
 * EXIF metadata extractor using exifr.
 * Works in the browser (File/Blob) and on Node.js (Buffer/ArrayBuffer).
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
  /** Camera manufacturer (EXIF Make) */
  make: string | null;
  /** Camera model (EXIF Model) */
  model: string | null;
  /**
   * Software tag — present when the image was post-processed.
   * Examples: "Adobe Photoshop", "Canva", "Snapseed", "VSCO", etc.
   */
  software: string | null;
  /** True when at least GPS or takenAt was found */
  hasExif: boolean;
}

/** Software strings that indicate post-processing / editing */
const EDITED_SOFTWARE_PATTERNS = [
  "photoshop",
  "lightroom",
  "canva",
  "snapseed",
  "vsco",
  "picsart",
  "facetune",
  "afterlight",
  "pixlr",
  "gimp",
  "capture one",
  "darktable",
  "paint.net",
  "preview",        // macOS Preview can re-save
  "inkscape",
  "illustrator",
  "affinity",
];

/**
 * Returns true when the Software EXIF tag matches a known editing app.
 * Camera firmware strings (e.g. "HDR Package 2.0", "Exynos") are left through.
 */
export function isEditedBySoftware(software: string | null): boolean {
  if (!software) return false;
  const lower = software.toLowerCase();
  return EDITED_SOFTWARE_PATTERNS.some((pattern) => lower.includes(pattern));
}

/**
 * Extract GPS, DateTime, camera Make/Model, and Software EXIF metadata
 * from a File, Blob, Buffer, or ArrayBuffer.
 *
 * @param source - Raw image bytes or a browser File/Blob object
 * @returns Parsed EXIF fields, or nulls if tags are absent.
 */
export async function extractExif(
  source: File | Blob | Buffer | ArrayBuffer
): Promise<ExifResult> {
  try {
    // Only parse the tags we care about — faster than full parse
    const parsed = await exifr.parse(source, {
      pick: [
        "GPSLatitude",
        "GPSLongitude",
        "GPSLatitudeRef",
        "GPSLongitudeRef",
        "DateTimeOriginal",
        "CreateDate",
        "Make",
        "Model",
        "Software",
      ],
      translateValues: true,
    });

    if (!parsed) {
      console.log("[EXIF GPS Debug] exifr parsed output is null/undefined");
      return {
        latitude: null,
        longitude: null,
        takenAt: null,
        make: null,
        model: null,
        software: null,
        hasExif: false,
      };
    }

    console.log("[EXIF GPS Debug] Raw parsed metadata:", {
      GPSLatitude: parsed.GPSLatitude,
      GPSLatitudeRef: parsed.GPSLatitudeRef,
      GPSLongitude: parsed.GPSLongitude,
      GPSLongitudeRef: parsed.GPSLongitudeRef,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
    });

    // Helper functions to safely parse coordinate values
    const parseRatioOrNumber = (val: any): number => {
      if (typeof val === "number") return val;
      if (val && typeof val === "object") {
        if (typeof val.numerator === "number" && typeof val.denominator === "number" && val.denominator !== 0) {
          return val.numerator / val.denominator;
        }
      }
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };

    const convertDMSToDecimal = (val: any, ref: string | null): number | null => {
      if (val === undefined || val === null) return null;

      let decimal = 0;

      if (typeof val === "number") {
        decimal = val;
      } else if (
        Array.isArray(val) ||
        val instanceof Float32Array ||
        val instanceof Float64Array ||
        (typeof val === "object" && "length" in val)
      ) {
        const degrees = val[0] !== undefined ? parseRatioOrNumber(val[0]) : 0;
        const minutes = val[1] !== undefined ? parseRatioOrNumber(val[1]) : 0;
        const seconds = val[2] !== undefined ? parseRatioOrNumber(val[2]) : 0;

        decimal = degrees + minutes / 60 + seconds / 3600;
        console.log(`[EXIF GPS Debug] Converted DMS [D:${degrees}, M:${minutes}, S:${seconds}] to decimal:`, decimal);
      } else if (typeof val === "object") {
        decimal = parseRatioOrNumber(val);
      } else {
        const num = Number(val);
        if (!isNaN(num)) {
          decimal = num;
        } else {
          return null;
        }
      }

      if (isNaN(decimal)) return null;

      if (ref) {
        const cleanRef = ref.trim().toUpperCase();
        if (cleanRef === "S" || cleanRef === "W") {
          decimal = -Math.abs(decimal);
        } else if (cleanRef === "N" || cleanRef === "E") {
          decimal = Math.abs(decimal);
        }
      }

      return decimal;
    };

    // Calculate latitude and longitude, using helper properties as fallback
    let latitude: number | null = convertDMSToDecimal(parsed.GPSLatitude, parsed.GPSLatitudeRef);
    let longitude: number | null = convertDMSToDecimal(parsed.GPSLongitude, parsed.GPSLongitudeRef);

    // Fallback to exifr default properties if manual parsing was unable to calculate
    if (latitude === null && typeof parsed.latitude === "number") {
      latitude = parsed.latitude;
    }
    if (longitude === null && typeof parsed.longitude === "number") {
      longitude = parsed.longitude;
    }

    console.log("[EXIF GPS Debug] Final coordinates output:", { latitude, longitude });

    // DateTimeOriginal takes priority over CreateDate (modification-resistant)
    const rawDate: Date | string | null =
      parsed.DateTimeOriginal ?? parsed.CreateDate ?? null;

    let takenAt: Date | null = null;
    if (rawDate) {
      const d = rawDate instanceof Date ? rawDate : new Date(rawDate);
      takenAt = isNaN(d.getTime()) ? null : d;
    }

    const make: string | null =
      typeof parsed.Make === "string" && parsed.Make.trim() !== ""
        ? parsed.Make.trim()
        : null;

    const model: string | null =
      typeof parsed.Model === "string" && parsed.Model.trim() !== ""
        ? parsed.Model.trim()
        : null;

    const software: string | null =
      typeof parsed.Software === "string" && parsed.Software.trim() !== ""
        ? parsed.Software.trim()
        : null;

    const hasExif =
      latitude !== null ||
      longitude !== null ||
      takenAt !== null ||
      make !== null;

    return { latitude, longitude, takenAt, make, model, software, hasExif };
  } catch (err) {
    console.error("[EXIF GPS Debug] Exception while extracting EXIF:", err);
    // exifr throws if the file is not a valid image or has no APP1 segment
    return {
      latitude: null,
      longitude: null,
      takenAt: null,
      make: null,
      model: null,
      software: null,
      hasExif: false,
    };
  }
}
