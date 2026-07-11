"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useActivities } from "@/features/activity/hooks/use-activities";
import { StatusBadge } from "@/features/activity/components/status-badge";
import Link from "next/link";

function ActivityImage({ src, alt }: { src: string | null; alt: string }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <span className="text-2xl">♻️</span>;
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="h-full w-full object-cover"
    />
  );
}

export default function RiwayatPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Search & Filter states
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load activities
  const { data, isLoading, isError } = useActivities({
    status: status ? (status as any) : undefined,
    search: search || undefined,
    page,
    limit: 20,
  });

  if (authLoading || !user) {
    return (
      <div className="flex h-[400px] items-center justify-center font-body text-sm text-ink-400">
        Memproses otorisasi...
      </div>
    );
  }

  const activities = data?.activities || [];
  const meta = data?.meta;

  // Additional client-side date filtering
  const filteredActivities = activities.filter((act) => {
    if (!dateFilter) return true;
    const actDate = new Date(act.activityDate).toISOString().split("T")[0];
    return actDate === dateFilter;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900 tracking-tight">
            Riwayat Aktivitas
          </h1>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-paper-200 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Cari Aktivitas</label>
          <input
            type="text"
            placeholder="Cari berdasarkan judul..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Filter Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu Verifikasi</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Filter Tanggal</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
          />
        </div>
      </div>

      {isError && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-4 text-center text-sm text-rust-600">
          Gagal memuat riwayat aktivitas. Silakan muat ulang halaman.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-paper-200 bg-white p-5 h-24" />
          ))}
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400 max-w-lg mx-auto">
          <svg className="mx-auto h-12 w-12 opacity-35" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-3 text-base font-semibold text-ink-900">Aktivitas Tidak Ditemukan</h3>
          <p className="mt-1 text-sm">Belum ada laporan aktivitas yang cocok dengan filter atau pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredActivities.map((act) => {
            const photoUrl = act.photos?.[0]?.imageUrl || null;

            return (
              <div
                key={act.id}
                className="rounded-2xl border border-paper-200 bg-white p-5 shadow-xs flex flex-col md:flex-row gap-5 items-start md:items-center justify-between hover:border-moss-500 transition duration-300"
              >
                <div className="flex gap-4 items-center flex-1 min-w-0 w-full">
                  {/* Photo Thumbnail */}
                  <div className="h-16 w-16 shrink-0 rounded-xl border border-paper-200 bg-paper-50 overflow-hidden flex items-center justify-center">
                    <ActivityImage src={photoUrl} alt={act.title} />
                  </div>
                  
                  {/* Info details */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-moss-700 bg-moss-50 px-2 py-0.5 rounded-md font-mono">
                        {act.category?.name || "Aksi"}
                      </span>
                      <span className="text-xs text-ink-400 font-mono">{formatDate(act.activityDate)}</span>
                    </div>
                    <h3 className="text-sm font-bold text-ink-900 truncate leading-tight">{act.title}</h3>
                    {act.location && (
                      <p className="text-xs text-ink-400 truncate">📍 {act.location}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-paper-100 pt-3 md:pt-0 shrink-0">
                  <div className="text-left md:text-right font-mono">
                    <p className="text-[9px] uppercase tracking-wider text-ink-400 font-bold">Poin Diperoleh</p>
                    <p className="text-lg font-black text-moss-800">
                      +{act.category?.pointReward ?? 0} <span className="text-xs font-normal text-ink-450">Pts</span>
                    </p>
                  </div>
                  <StatusBadge status={act.status} />
                  <Link
                    href={`/activity/${act.id}`}
                    className="px-4 py-2 border border-paper-200 hover:bg-paper-50 text-ink-700 text-xs font-semibold rounded-xl transition"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-paper-200 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex h-9 items-center justify-center rounded-md border border-paper-200 bg-white px-4 text-sm font-medium text-ink-700 hover:bg-paper-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Sebelumnya
          </button>
          <span className="font-mono text-xs text-ink-400">
            Halaman {meta.page} dari {meta.totalPages}
          </span>
          <button
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex h-9 items-center justify-center rounded-md border border-paper-200 bg-white px-4 text-sm font-medium text-ink-700 hover:bg-paper-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Selanjutnya →
          </button>
        </div>
      )}
    </div>
  );
}
