"use client";

import { useEffect, useRef, useState } from "react";
import { extractExif, isEditedBySoftware, type ExifResult } from "@/lib/exif";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PhotoExifData {
  /** Derived from DateTimeOriginal */
  activityDate: Date;
  /** Human-readable address from reverse geocoding */
  location: string;
  /** Raw GPS coordinates */
  latitude: number;
  longitude: number;
  /** Camera info for display */
  cameraInfo: string;
  /**
   * True when the Software EXIF tag indicates the photo was edited
   * (Photoshop, Canva, Snapseed, etc.). The form still allows upload
   * but flags it for manual verification.
   */
  flaggedAsEdited: boolean;
  /** The raw software tag value, for display/logging */
  software: string | null;
}

export type ExifValidationError =
  | "NO_EXIF"           // no EXIF at all
  | "MISSING_DATE"      // DateTimeOriginal absent
  | "MISSING_GPS"       // no GPS coordinates
  | "MISSING_CAMERA";   // no Make/Model

interface PhotoCaptureInputProps {
  value: File | null;
  onChange: (file: File | null) => void;
  /** Called once EXIF is successfully parsed from the selected photo */
  onExifReady: (data: PhotoExifData) => void;
  /** Called when EXIF is invalid or missing required fields */
  onExifError: (error: ExifValidationError) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reverse geocoding via Nominatim (OpenStreetMap, no API key required)
// ─────────────────────────────────────────────────────────────────────────────

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=id`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Ecolution-App/1.0" },
    });
    if (!res.ok) throw new Error("Nominatim request failed");
    const data = await res.json();
    // Build a clean, short address from the address components
    const addr = data.address ?? {};
    const parts = [
      addr.road || addr.pedestrian || addr.footway,
      addr.neighbourhood || addr.suburb || addr.village,
      addr.city || addr.town || addr.county,
      addr.state,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : (data.display_name ?? `${lat}, ${lon}`);
  } catch {
    // Fallback to coordinate string if geocoding fails
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Status icons
// ─────────────────────────────────────────────────────────────────────────────

function IconCheckCircle() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-moss-700" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-ochre-600 shrink-0" aria-hidden="true">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-7 w-7" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation helper
// ─────────────────────────────────────────────────────────────────────────────

function validateExif(exif: ExifResult): ExifValidationError | null {
  if (!exif.hasExif) return "NO_EXIF";
  if (!exif.takenAt) return "MISSING_DATE";
  if (exif.latitude === null || exif.longitude === null) return "MISSING_GPS";
  if (!exif.make && !exif.model) return "MISSING_CAMERA";
  return null;
}

function friendlyError(error: ExifValidationError): string {
  switch (error) {
    case "NO_EXIF":
    case "MISSING_CAMERA":
      return "Foto tidak memenuhi syarat. Gunakan foto asli yang diambil langsung dari kamera dengan lokasi dan metadata aktif.";
    case "MISSING_DATE":
      return "Foto tidak memenuhi syarat. Gunakan foto asli yang diambil langsung dari kamera dengan lokasi dan metadata aktif.";
    case "MISSING_GPS":
      return "Foto tidak memenuhi syarat. Gunakan foto asli yang diambil langsung dari kamera dengan lokasi dan metadata aktif.";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

type ParseState =
  | { status: "idle" }
  | { status: "parsing" }
  | { status: "error"; error: ExifValidationError }
  | { status: "ready"; data: PhotoExifData };

/**
 * PhotoCaptureInput — file picker that auto-reads EXIF metadata.
 *
 * On photo selection:
 *  1. Reads EXIF via exifr (browser-side, no upload needed)
 *  2. Validates DateTimeOriginal, GPS, and Make/Model are present
 *  3. Reverse-geocodes GPS → human-readable address (Nominatim)
 *  4. Flags photos edited with known software (Photoshop, Canva, etc.)
 *  5. Calls onExifReady with parsed data, or onExifError on failure
 *
 * IMPORTANT: keep this a plain <input type="file">.
 * Do NOT rebuild with a custom <video>/<canvas> camera UI —
 * canvas re-encoding strips EXIF (GPS + capture time), and the
 * backend rejects activities with missing EXIF. The native capture
 * keeps the original EXIF intact.
 */
export function PhotoCaptureInput({
  value,
  onChange,
  onExifReady,
  onExifError,
}: PhotoCaptureInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [parseState, setParseState] = useState<ParseState>({ status: "idle" });

  // Build/revoke object URL for preview
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      setParseState({ status: "idle" });
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  async function handleFileChange(file: File | null) {
    onChange(file);

    if (!file) {
      setParseState({ status: "idle" });
      return;
    }

    setParseState({ status: "parsing" });

    try {
      const exif = await extractExif(file);
      const validationError = validateExif(exif);

      if (validationError) {
        setParseState({ status: "error", error: validationError });
        onExifError(validationError);
        return;
      }

      // All required fields are present at this point
      const lat = exif.latitude!;
      const lon = exif.longitude!;
      const takenAt = exif.takenAt!;
      const make = exif.make!;
      const model = exif.model;

      // Reverse geocode in parallel, don't block on failure
      const location = await reverseGeocode(lat, lon);

      const cameraInfo = model ? `${make} ${model}`.trim() : make;
      const flaggedAsEdited = isEditedBySoftware(exif.software);

      const data: PhotoExifData = {
        activityDate: takenAt,
        location,
        latitude: lat,
        longitude: lon,
        cameraInfo,
        flaggedAsEdited,
        software: exif.software,
      };

      setParseState({ status: "ready", data });
      onExifReady(data);
    } catch {
      setParseState({ status: "error", error: "NO_EXIF" });
      onExifError("NO_EXIF");
    }
  }

  function handleReset() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
    setParseState({ status: "idle" });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-wide text-ink-400">Foto Bukti</label>

      {/* Photo preview */}
      {previewUrl ? (
        <div className="relative overflow-hidden rounded-md border border-paper-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Preview foto aktivitas" className="h-56 w-full object-cover" />
          <button
            type="button"
            onClick={handleReset}
            className="absolute right-2 top-2 rounded-md bg-ink-900/70 px-2 py-1 text-xs font-medium text-paper-50 hover:bg-ink-900"
          >
            Ganti Foto
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-paper-200 text-ink-400 transition hover:border-moss-500 hover:text-moss-700"
        >
          <IconCamera />
          <span className="text-sm font-medium">Ambil / Unggah Foto Asli</span>
          <span className="text-xs opacity-70">JPEG, HEIC, atau TIFF · maks. 10MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/heic,image/heif,image/tiff,image/jpg"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
      />

      {/* EXIF parse status */}
      {parseState.status === "parsing" && (
        <div className="flex items-center gap-2 rounded-md border border-paper-200 bg-paper-50 px-3 py-2.5 text-xs text-ink-400">
          <svg className="h-3.5 w-3.5 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Membaca metadata foto & lokasi GPS...</span>
        </div>
      )}

      {parseState.status === "error" && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2.5 rounded-md border border-rust-500/30 bg-rust-500/5 px-3 py-2.5 text-sm text-rust-600"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <span>{friendlyError(parseState.error)}</span>
        </div>
      )}

      {parseState.status === "ready" && (
        <div className="space-y-2">
          {/* Edited warning — show before the success info */}
          {parseState.data.flaggedAsEdited && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-md border border-ochre-200 bg-ochre-50/60 px-3 py-2.5 text-xs text-ochre-600"
            >
              <IconWarning />
              <span>
                Foto terdeteksi diedit menggunakan{" "}
                <span className="font-semibold">{parseState.data.software}</span>. Foto akan ditandai
                untuk verifikasi manual oleh admin.
              </span>
            </div>
          )}

          {/* Metadata summary */}
          <div className="rounded-md border border-moss-200 bg-moss-50/60 px-3 py-2.5 text-xs text-ink-700 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-moss-700 mb-1">
              <IconCheckCircle />
              <span>Metadata foto berhasil dibaca</span>
            </div>
            <MetaRow icon="📅" label="Diambil pada" value={parseState.data.activityDate.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} />
            <MetaRow icon="📍" label="Lokasi GPS" value={parseState.data.location} />
            <MetaRow icon="📷" label="Kamera" value={parseState.data.cameraInfo} />
          </div>
        </div>
      )}

      {/* Persistent instruction */}
      <p className="text-xs text-ink-400">
        Foto harus diambil langsung dari kamera dengan GPS aktif. Metadata EXIF (tanggal, lokasi, kamera)
        wajib tersedia — foto tanpa metadata atau yang telah diedit tidak dapat diterima.
      </p>
    </div>
  );
}

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <span aria-hidden="true">{icon}</span>
      <span className="text-ink-400 shrink-0">{label}:</span>
      <span className="font-medium text-ink-700 break-words min-w-0">{value}</span>
    </div>
  );
}
