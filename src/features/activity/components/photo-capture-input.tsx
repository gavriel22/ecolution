"use client";

import { useEffect, useRef, useState } from "react";

interface PhotoCaptureInputProps {
  value: File | null;
  onChange: (file: File | null) => void;
}

/**
 * This is the answer to "untuk foto bisakah langsung diambil dari kamera?"
 *
 * `capture="environment"` tells mobile browsers to open the rear camera
 * directly instead of the file picker. On desktop it's ignored and falls
 * back to a normal file dialog — so this one input works everywhere.
 *
 * IMPORTANT: keep this a plain <input type="file">. Do NOT rebuild this with
 * a custom <video>/<canvas> camera UI — canvas re-encoding strips EXIF
 * (GPS + capture time), and the backend rejects activities with missing
 * EXIF. The native camera capture keeps the original EXIF intact.
 */
export function PhotoCaptureInput({ value, onChange }: PhotoCaptureInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-wide text-ink-400">Foto Bukti</label>

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-md border border-paper-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Preview foto aktivitas" className="h-56 w-full object-cover" />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute right-2 top-2 rounded-md bg-ink-900/70 px-2 py-1 text-xs font-medium text-paper-50 hover:bg-ink-900"
          >
            Ganti Foto
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-paper-200 text-ink-400 transition hover:border-moss-500 hover:text-moss-700"
        >
          <span className="text-2xl">📷</span>
          <span className="text-sm font-medium">Ambil / Unggah Foto</span>
          <span className="text-xs">JPEG, HEIC, atau TIFF · maks. 10MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        required={!value}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      <p className="text-xs text-ink-400">
        Pastikan lokasi (GPS) HP kamu aktif saat memotret — sistem memverifikasi keaslian aktivitas dari
        metadata foto.
      </p>
    </div>
  );
}
