"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useChallenge,
  useJoinChallenge,
  useLeaveChallenge,
} from "@/features/challenge/hooks/use-challenges";
import { ApiError } from "@/lib/api-client";

export default function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: challenge, isLoading, isError } = useChallenge(id);
  const joinMutation = useJoinChallenge();
  const leaveMutation = useLeaveChallenge();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (isError) {
    return (
      <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-4 text-center text-sm text-rust-600 font-body">
        Gagal memuat detail tantangan. Silakan kembali ke katalog.
        <div className="mt-2">
          <Link href="/challenge" className="text-moss-700 hover:underline font-semibold">
            ← Kembali ke Daftar Tantangan
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !challenge) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-1/4 rounded bg-paper-100" />
        <div className="rounded-lg border border-paper-200 bg-white p-6 space-y-4">
          <div className="h-4 w-12 rounded bg-paper-100" />
          <div className="h-8 w-2/3 rounded bg-paper-100" />
          <div className="h-4 w-full rounded bg-paper-100" />
          <div className="h-4 w-1/2 rounded bg-paper-100" />
        </div>
      </div>
    );
  }

  const handleJoin = () => {
    setErrorMsg(null);
    joinMutation.mutate(challenge.id, {
      onSuccess: () => {
        alert("Berhasil bergabung ke tantangan!");
      },
      onError: (err) => {
        setErrorMsg(err instanceof ApiError ? err.message : "Gagal bergabung ke tantangan.");
      },
    });
  };

  const handleLeave = () => {
    setErrorMsg(null);
    if (confirm("Apakah Anda yakin ingin keluar dari tantangan ini? Seluruh progres Anda untuk tantangan ini akan dihapus.")) {
      leaveMutation.mutate(challenge.id, {
        onSuccess: () => {
          alert("Anda telah keluar dari tantangan.");
        },
        onError: (err) => {
          setErrorMsg(err instanceof ApiError ? err.message : "Gagal keluar dari tantangan.");
        },
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isJoined = challenge.progress !== undefined;
  const progressInfo = challenge.progress;
  const isCompleted = progressInfo ? progressInfo.currentValue >= progressInfo.targetValue : false;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-ink-400">
        <Link href="/challenge" className="hover:text-moss-700">Tantangan</Link>
        <span>/</span>
        <span className="text-ink-900 truncate max-w-[200px]">{challenge.title}</span>
      </nav>

      {errorMsg && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 px-4 py-3 text-sm text-rust-600 font-body">
          {errorMsg}
        </div>
      )}

      {/* Main card */}
      <div className="rounded-lg border border-paper-200 bg-white p-6 shadow-xs space-y-6 font-body">
        {/* Banner/Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-moss-700 bg-moss-50 px-2.5 py-1 rounded border border-moss-200">
              {challenge.category?.name || "Kategori"}
            </span>
            {isJoined && (
              <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${
                isCompleted ? "bg-moss-700 text-paper-50 border-moss-700" : "bg-ochre-50 text-ochre-700 border-ochre-200"
              }`}>
                {isCompleted ? "Selesai" : "Diikuti"}
              </span>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 leading-tight">
            {challenge.title}
          </h1>

          <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-ink-400">
            <span>Mulai: {formatDate(challenge.startDate)}</span>
            <span className="hidden sm:inline">·</span>
            <span>Berakhir: {formatDate(challenge.endDate)}</span>
          </div>
        </div>

        {/* Image if provided */}
        {challenge.imageUrl && (
          <div className="aspect-video w-full rounded-md bg-paper-50 flex items-center justify-center overflow-hidden border border-paper-100">
            <img src={challenge.imageUrl} alt={challenge.title} className="h-full w-full object-cover" />
          </div>
        )}

        {/* Progress Box */}
        {isJoined && progressInfo && (
          <div className="rounded-lg bg-paper-50 border border-paper-200 p-5 space-y-3">
            <div className="flex justify-between items-center text-sm font-semibold text-ink-900">
              <span>Progres Kampanye Anda</span>
              <span className="font-mono text-moss-700">
                {progressInfo.currentValue} / {progressInfo.targetValue} Aksi ({progressInfo.progressPercent}%)
              </span>
            </div>
            
            <div className="h-2.5 w-full rounded-full bg-paper-200 overflow-hidden">
              <div
                className="h-full bg-moss-700 rounded-full transition-all duration-500"
                style={{ width: `${progressInfo.progressPercent}%` }}
              />
            </div>

            {isCompleted ? (
              <p className="text-xs text-moss-700 font-semibold pt-1">
                🎉 Selamat! Anda telah menyelesaikan tantangan ini dan memenangkan reward poin.
              </p>
            ) : (
              <p className="text-xs text-ink-400 pt-1 leading-normal">
                Selesaikan {progressInfo.targetValue - progressInfo.currentValue} aksi lingkungan lagi untuk menyelesaikan tantangan ini.
              </p>
            )}
          </div>
        )}

        {/* Specifications */}
        <div className="grid grid-cols-2 gap-4 border-t border-b border-paper-100 py-4 text-center">
          <div className="space-y-0.5">
            <p className="text-[10px] text-ink-400 font-bold uppercase tracking-wider">Poin Hadiah</p>
            <p className="font-display font-bold text-moss-700 text-lg">
              +{challenge.pointReward} Pts
            </p>
          </div>
          <div className="space-y-0.5 border-l border-paper-100">
            <p className="text-[10px] text-ink-400 font-bold uppercase tracking-wider font-body">Target Aksi</p>
            <p className="font-mono text-ink-900 font-bold text-lg">
              {challenge.target} Aksi
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400">Aturan & Detail</h3>
          <p className="font-body text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
            {challenge.description || "Tidak ada deskripsi detail tantangan."}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-paper-100">
          <Link
            href="/challenge"
            className="flex-1 text-center rounded-md border border-paper-200 py-2.5 text-sm font-semibold text-ink-700 hover:bg-paper-50 transition"
          >
            Kembali
          </Link>
          
          {!isJoined ? (
            <button
              disabled={joinMutation.isPending}
              onClick={handleJoin}
              className="flex-1 rounded-md bg-moss-700 py-2.5 text-sm font-semibold text-paper-50 hover:bg-moss-900 transition"
            >
              {joinMutation.isPending ? "Memproses..." : "Ikuti Tantangan"}
            </button>
          ) : (
            <>
              {!isCompleted && (
                <button
                  disabled={leaveMutation.isPending}
                  onClick={handleLeave}
                  className="flex-1 rounded-md border border-rust-200 bg-white py-2.5 text-sm font-semibold text-rust-600 hover:bg-rust-50 transition"
                >
                  {leaveMutation.isPending ? "Memproses..." : "Keluar Tantangan"}
                </button>
              )}
              {isCompleted ? (
                <span className="flex-1 text-center rounded-md bg-paper-100 py-2.5 text-sm font-semibold text-ink-400 select-none">
                  Sudah Selesai
                </span>
              ) : (
                <Link
                  href="/activity/new"
                  className="flex-1 text-center rounded-md bg-moss-700 py-2.5 text-sm font-semibold text-paper-50 hover:bg-moss-900 transition"
                >
                  Lapor Aksi
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
