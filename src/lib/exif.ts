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
    // Parse full EXIF metadata ensuring GPS, TIFF, and EXIF blocks are fully parsed
    const parsed = await exifr.parse(source, {
      gps: true,
      exif: true,
      tiff: true,
      translateValues: true,
    });

    console.log("[EXIF GPS Debug] Full parsed object from exifr:", parsed);

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

    let latitude: number | null = null;
    let longitude: number | null = null;

    // Gather all potential variables from root and nested objects (parsed.gps or parsed.GPS)
    const rawLatitude = parsed.latitude ?? parsed.gps?.latitude ?? parsed.GPS?.latitude ?? null;
    const rawLongitude = parsed.longitude ?? parsed.gps?.longitude ?? parsed.GPS?.longitude ?? null;

    const rawGPSLatitude = parsed.GPSLatitude ?? parsed.gps?.GPSLatitude ?? parsed.GPS?.GPSLatitude ?? null;
    const rawGPSLongitude = parsed.GPSLongitude ?? parsed.gps?.GPSLongitude ?? parsed.GPS?.GPSLongitude ?? null;

    const rawGPSLatitudeRef = parsed.GPSLatitudeRef ?? parsed.gps?.GPSLatitudeRef ?? parsed.GPS?.GPSLatitudeRef ?? null;
    const rawGPSLongitudeRef = parsed.GPSLongitudeRef ?? parsed.gps?.GPSLongitudeRef ?? parsed.GPS?.GPSLongitudeRef ?? null;

    console.log("[EXIF GPS Debug] Specific EXIF Fields Checked:", {
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      GPSLatitude: parsed.GPSLatitude,
      GPSLongitude: parsed.GPSLongitude,
      GPSLatitudeRef: parsed.GPSLatitudeRef,
      GPSLongitudeRef: parsed.GPSLongitudeRef,
      gps: parsed.gps,
      GPS: parsed.GPS,
    });

    console.log("[EXIF GPS Debug] Extracted raw variables:", {
      rawLatitude,
      rawLongitude,
      rawGPSLatitude,
      rawGPSLongitude,
      rawGPSLatitudeRef,
      rawGPSLongitudeRef,
    });

    // Determine coordinate resolution method
    if (
      typeof rawLatitude === "number" &&
      !isNaN(rawLatitude) &&
      typeof rawLongitude === "number" &&
      !isNaN(rawLongitude)
    ) {
      console.log("[EXIF GPS Debug] Latitude parsed directly:", rawLatitude);
      console.log("[EXIF GPS Debug] Longitude parsed directly:", rawLongitude);
      latitude = rawLatitude;
      longitude = rawLongitude;
    } else {
      console.log("[EXIF GPS Debug] Direct latitude/longitude from exifr is not valid or unavailable. Trying manual DMS conversion...");
      if (rawGPSLatitude !== null && rawGPSLongitude !== null) {
        latitude = convertDMSToDecimal(rawGPSLatitude, rawGPSLatitudeRef);
        longitude = convertDMSToDecimal(rawGPSLongitude, rawGPSLongitudeRef);
      } else {
        console.log("[EXIF GPS Debug] GPS field not found. Coordinates could not be resolved from raw DMS fields.");
      }
    }

    if (latitude === null || longitude === null) {
      console.log("[EXIF GPS Debug] Validation failed. Reason: GPS coordinates are missing or unresolved.");
    } else {
      console.log("[EXIF GPS Debug] GPS resolved successfully:", { latitude, longitude });
    }

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
