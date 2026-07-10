"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCreateActivity } from "../hooks/use-create-activity";
import { CategorySelect } from "./category-select";
import { PhotoCaptureInput, type PhotoExifData, type ExifValidationError } from "./photo-capture-input";
import { ApiError } from "@/lib/api-client";

export function ActivityForm() {
  const router = useRouter();
  const createActivity = useCreateActivity();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  // EXIF-derived state — populated automatically after photo selection
  const [exifData, setExifData] = useState<PhotoExifData | null>(null);
  const [exifError, setExifError] = useState<ExifValidationError | null>(null);

  function handleExifReady(data: PhotoExifData) {
    setExifData(data);
    setExifError(null);
  }

  function handleExifError(error: ExifValidationError) {
    // NOTE: do NOT clear the photo here — the file is still selected
    // and the preview should remain visible. Only the EXIF status changes.
    setExifError(error);
    setExifData(null);
  }

  function handlePhotoChange(file: File | null) {
    setPhoto(file);
    if (!file) {
      setExifData(null);
      setExifError(null);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!photo || !exifData) return;

    createActivity.mutate(
      {
        image: photo,
        title,
        description: description || undefined,
        categoryId,
        // Date comes from EXIF DateTimeOriginal — not editable by user
        activityDate: exifData.activityDate.toISOString(),
        // Location comes from reverse geocoding GPS coordinates
        location: exifData.location || undefined,
      },
      {
        onSuccess: (res) => router.push(`/activity/${res.data.id}`),
      }
    );
  }

  const errorMessage =
    createActivity.error instanceof ApiError
      ? createActivity.error.message
      : createActivity.error
        ? "Gagal mengunggah aktivitas. Coba lagi."
        : null;

  // Submit is only allowed when a photo with valid EXIF is selected
  // (exifData is only set after successful EXIF validation)
  const canSubmit = !!photo && !!exifData && !createActivity.isPending;

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-lg space-y-5">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-semibold text-ink-900">Lapor Aktivitas</h1>
        <p className="text-sm text-ink-400">
          Catat aksi lingkunganmu untuk mendapatkan poin. Tanggal dan lokasi diambil otomatis dari foto.
        </p>
      </div>

      {/* API error banner */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-rust-500/30 bg-rust-500/5 px-3 py-2.5 text-sm text-rust-600"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Photo picker — handles EXIF reading, validation, and geocoding internally */}
      <PhotoCaptureInput
        value={photo}
        onChange={handlePhotoChange}
        onExifReady={handleExifReady}
        onExifError={handleExifError}
      />

      {/* Rest of the form is only shown once a valid photo is selected */}
      {exifData && (
        <>
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Judul
            </label>
            <input
              id="title"
              required
              minLength={3}
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
              placeholder="Contoh: Bersih-bersih Sampah Plastik"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="categoryId" className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Kategori
            </label>
            <CategorySelect value={categoryId} onChange={setCategoryId} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Deskripsi <span className="normal-case text-ink-400/70">(opsional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
              placeholder="Ceritakan aktivitasmu secara singkat"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        aria-busy={createActivity.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-moss-700 px-4 py-2.5 font-medium text-paper-50 transition hover:bg-moss-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {createActivity.isPending && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        <span>{createActivity.isPending ? "Mengunggah..." : "Kirim Aktivitas"}</span>
      </button>
    </form>
  );
}
