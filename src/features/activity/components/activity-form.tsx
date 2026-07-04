"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCreateActivity } from "../hooks/use-create-activity";
import { CategorySelect } from "./category-select";
import { PhotoCaptureInput } from "./photo-capture-input";
import { ApiError } from "@/lib/api-client";

function toLocalDateTimeInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function ActivityForm() {
  const router = useRouter();
  const createActivity = useCreateActivity();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [activityDate, setActivityDate] = useState(() => toLocalDateTimeInputValue(new Date()));
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!photo) return;

    createActivity.mutate(
      {
        image: photo,
        title,
        description: description || undefined,
        categoryId,
        activityDate: new Date(activityDate).toISOString(),
        location: location || undefined,
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

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-lg space-y-5">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-semibold text-ink-900">Lapor Aktivitas</h1>
        <p className="text-sm text-ink-400">Catat aksi lingkunganmu untuk mendapatkan poin.</p>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 px-3 py-2 text-sm text-rust-600">
          {errorMessage}
        </div>
      )}

      <PhotoCaptureInput value={photo} onChange={setPhoto} />

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
        <label htmlFor="activityDate" className="text-xs font-medium uppercase tracking-wide text-ink-400">
          Tanggal & Waktu Aktivitas
        </label>
        <input
          id="activityDate"
          type="datetime-local"
          required
          value={activityDate}
          onChange={(e) => setActivityDate(e.target.value)}
          className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="location" className="text-xs font-medium uppercase tracking-wide text-ink-400">
          Lokasi <span className="normal-case text-ink-400/70">(opsional)</span>
        </label>
        <input
          id="location"
          maxLength={255}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
          placeholder="Contoh: Taman Kota Blok B"
        />
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

      <button
        type="submit"
        disabled={createActivity.isPending || !photo}
        className="w-full rounded-md bg-moss-700 px-4 py-2.5 font-medium text-paper-50 transition hover:bg-moss-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {createActivity.isPending ? "Mengunggah..." : "Kirim Aktivitas"}
      </button>
    </form>
  );
}
