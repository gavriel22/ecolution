"use client";

import { useActivityCategories } from "../hooks/use-activity-categories";

interface CategorySelectProps {
  value: string;
  onChange: (categoryId: string) => void;
}

/**
 * This is the answer to "harus masukkan category id?" — the user never sees
 * or types a UUID. They pick a category by name; `value` here is the id,
 * kept in the parent form's state and wired silently into the API payload.
 */
export function CategorySelect({ value, onChange }: CategorySelectProps) {
  const { data: categories, isLoading, isError } = useActivityCategories();

  if (isLoading) {
    return <div className="h-[42px] animate-pulse rounded-md bg-paper-100" />;
  }

  if (isError || !categories?.length) {
    return (
      <p className="text-sm text-rust-600">
        Gagal memuat daftar kategori. Coba muat ulang halaman.
      </p>
    );
  }

  return (
    <select
      id="categoryId"
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
    >
      <option value="" disabled>
        Pilih kategori aktivitas
      </option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name} · +{category.pointReward} poin
        </option>
      ))}
    </select>
  );
}
