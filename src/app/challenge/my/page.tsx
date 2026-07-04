"use client";

import Link from "next/link";
import { useMyChallenges } from "@/features/challenge/hooks/use-challenges";

export default function MyChallengesPage() {
  const { data: myChallenges = [], isLoading, isError } = useMyChallenges();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
            Tantanganku
          </h1>
          <p className="font-body text-sm text-ink-400 mt-1">
            Pantau perkembangan target dan waktu deadline tantangan aktif yang sedang Anda ikuti.
          </p>
        </div>
        <Link
          href="/challenge"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-white border border-paper-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-paper-50 transition shadow-xs self-start sm:self-auto"
        >
          Jelajah Tantangan
        </Link>
      </div>

      {isError && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-4 text-center text-sm text-rust-600 font-body">
          Gagal memuat daftar tantangan Anda. Silakan coba lagi.
        </div>
      )}

      {isLoading ? (
        /* Loading */
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-paper-200 bg-white p-5 space-y-4">
              <div className="h-4 w-1/4 rounded bg-paper-100" />
              <div className="h-5 w-2/3 rounded bg-paper-100" />
              <div className="h-4 w-full rounded bg-paper-100" />
            </div>
          ))}
        </div>
      ) : myChallenges.length === 0 ? (
        /* Empty State */
        <div className="rounded-lg border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400 max-w-lg mx-auto font-body">
          <svg className="mx-auto h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-3 text-base font-semibold text-ink-900">Belum Ada Tantangan</h3>
          <p className="mt-1 text-sm">Anda belum mendaftar di tantangan apa pun saat ini.</p>
          <div className="mt-6">
            <Link href="/challenge" className="inline-flex rounded-md bg-moss-700 px-4 py-2 text-sm font-semibold text-paper-50 hover:bg-moss-900 transition">
              Cari Tantangan Aktif
            </Link>
          </div>
        </div>
      ) : (
        /* List */
        <div className="space-y-4">
          {myChallenges.map((item) => {
            const c = item.challenge;
            const progress = c.progress;
            const isCompleted = item.status === "COMPLETED";

            return (
              <div
                key={item.id}
                className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs flex flex-col justify-between md:flex-row md:items-center gap-5 font-body"
              >
                {/* Specs */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-moss-700 bg-moss-50 px-2 py-0.5 rounded border border-moss-200">
                      {c.category?.name || "Tantangan"}
                    </span>
                    <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isCompleted ? "bg-moss-700 text-paper-50 border-moss-700" : "bg-ochre-50 text-ochre-700 border-ochre-200"
                    }`}>
                      {isCompleted ? "Selesai" : "Sedang Diikuti"}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-ink-900 leading-tight">
                    <Link href={`/challenge/${c.id}`} className="hover:text-moss-700">
                      {c.title}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-4 font-mono text-[10px] text-ink-400">
                    <span>Deadline: {formatDate(c.endDate)}</span>
                    <span>·</span>
                    <span className="text-moss-700 font-bold">Reward: +{c.pointReward} Pts</span>
                  </div>
                </div>

                {/* Progress bar info */}
                {progress && (
                  <div className="w-full md:w-64 space-y-1.5 shrink-0 bg-paper-50 p-3 rounded border border-paper-100">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-ink-700">
                      <span>Progres</span>
                      <span>
                        {progress.currentValue} / {progress.targetValue} Aksi
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-paper-200 overflow-hidden">
                      <div
                        className="h-full bg-moss-700 rounded-full transition-all duration-500"
                        style={{ width: `${progress.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t border-paper-100 md:border-0 pt-3 md:pt-0">
                  <Link
                    href={`/challenge/${c.id}`}
                    className="rounded-md border border-paper-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-paper-50 transition"
                  >
                    Rincian
                  </Link>
                  {!isCompleted && (
                    <Link
                      href="/activity/new"
                      className="rounded-md bg-moss-700 px-3 py-2 text-xs font-semibold text-paper-50 hover:bg-moss-900 transition"
                    >
                      Lapor Aksi
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
