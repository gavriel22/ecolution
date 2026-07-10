"use client";

import { useState } from "react";
import Link from "next/link";
import { useActivities } from "../hooks/use-activities";
import { ActivityCard } from "./activity-card";
import type { Activity, ActivityStatus } from "../types";

const STATUS_FILTERS: { label: string; value: ActivityStatus | undefined }[] = [
  { label: "Semua", value: undefined },
  { label: "Menunggu", value: "PENDING" },
  { label: "Disetujui", value: "APPROVED" },
  { label: "Ditolak", value: "REJECTED" },
];

export function ActivityList() {
  const [status, setStatus] = useState<ActivityStatus | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useActivities({ status, page, limit: 10 });

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-ink-900">Riwayat Aktivitas</h1>
        <Link
          href="/activity/new"
          className="rounded-md bg-moss-700 px-4 py-2 text-sm font-medium text-paper-50 hover:bg-moss-900"
        >
          + Lapor Aktivitas Baru
        </Link>
      </div>

      <div className="flex gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.label}
            onClick={() => {
              setStatus(filter.value);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              status === filter.value
                ? "bg-moss-700 text-paper-50"
                : "bg-paper-100 text-ink-700 hover:bg-paper-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-ink-400">Memuat aktivitas...</p>}
      {isError && <p className="text-sm text-rust-600">Gagal memuat aktivitas. Coba muat ulang halaman.</p>}

      {data && data.activities.length === 0 && (
        <div className="rounded-md border border-dashed border-paper-200 p-8 text-center text-sm text-ink-400">
          Belum ada aktivitas. Mulai catat aksi lingkunganmu yang pertama.
        </div>
      )}

      <div className="space-y-3">
        {data?.activities.map((activity: Activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="text-sm font-medium text-moss-700 disabled:opacity-40"
          >
            ← Sebelumnya
          </button>
          <span className="font-mono text-xs text-ink-400">
            Halaman {data.meta.page} / {data.meta.totalPages}
          </span>
          <button
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="text-sm font-medium text-moss-700 disabled:opacity-40"
          >
            Selanjutnya →
          </button>
        </div>
      )}
    </div>
  );
}
