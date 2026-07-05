"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useChallenges,
  useMyChallenges,
  useJoinChallenge,
} from "@/features/challenge/hooks/use-challenges";
import { toast } from "sonner";
import { useConfirm } from "@/providers/confirm-provider";

export default function ChallengesPage() {
  const confirm = useConfirm();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: challenges = [], isLoading: isLoadingList } = useChallenges({ search: search || undefined });
  const { data: myChallenges = [], isLoading: isLoadingMy } = useMyChallenges();
  const joinMutation = useJoinChallenge();

  const handleJoin = async (challengeId: string) => {
    if (await confirm("Apakah Anda yakin ingin bergabung dalam tantangan ini?")) {
      joinMutation.mutate(challengeId, {
        onSuccess: () => {
          toast.success("Berhasil bergabung! Selesaikan aksi lingkungan untuk meningkatkan progres Anda.");
        },
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getJoinedStatus = (challengeId: string) => {
    return myChallenges.find((mc) => mc.challenge.id === challengeId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
            Tantangan Lingkungan
          </h1>
          <p className="font-body text-sm text-ink-400 mt-1">
            Bergabunglah dalam berbagai tantangan aksi hijau untuk meraih bonus poin reward tambahan.
          </p>
        </div>
        <Link
          href="/challenge/my"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-moss-700 px-4 py-2 text-sm font-medium text-paper-50 transition-all hover:bg-moss-900 shadow-sm self-start sm:self-auto"
        >
          Tantanganku ({myChallenges.length})
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-lg border border-paper-200 bg-white p-4 shadow-xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari tantangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-paper-200 bg-white pl-10 pr-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20 font-body"
          />
          <svg className="absolute left-3 top-2.5 h-4.5 w-4.5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {isLoadingList || isLoadingMy ? (
        /* Skeletons */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-paper-200 bg-white p-5 space-y-4">
              <div className="h-4 w-1/4 rounded bg-paper-100" />
              <div className="h-6 w-3/4 rounded bg-paper-100" />
              <div className="h-12 w-full rounded bg-paper-100" />
              <div className="h-8 w-1/3 rounded bg-paper-100 pt-2" />
            </div>
          ))}
        </div>
      ) : challenges.length === 0 ? (
        /* Empty State */
        <div className="rounded-lg border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400 max-w-lg mx-auto font-body">
          <svg className="mx-auto h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-3 text-base font-semibold text-ink-900">Tantangan Tidak Ditemukan</h3>
          <p className="mt-1 text-sm">Tidak ada tantangan aktif saat ini yang cocok.</p>
        </div>
      ) : (
        /* Challenges Grid */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => {
            const joinedInfo = getJoinedStatus(challenge.id);
            const isJoined = !!joinedInfo;

            return (
              <div
                key={challenge.id}
                className="flex flex-col justify-between rounded-lg border border-paper-200 bg-white p-5 shadow-xs transition duration-300 hover:-translate-y-1 hover:border-moss-500 hover:shadow-md font-body space-y-4"
              >
                <div className="space-y-2">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-moss-700 bg-moss-50 px-2 py-0.5 rounded border border-moss-200">
                      {challenge.category?.name || "Aksi"}
                    </span>
                    {isJoined && (
                      <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        joinedInfo.status === "COMPLETED"
                          ? "bg-moss-700 text-paper-50 border-moss-700"
                          : "bg-ochre-50 text-ochre-700 border-ochre-200"
                      }`}>
                        {joinedInfo.status === "COMPLETED" ? "Selesai" : "Diikuti"}
                      </span>
                    )}
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-base font-bold text-ink-900 leading-snug">
                    <Link href={`/challenge/${challenge.id}`} className="hover:text-moss-700">
                      {challenge.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-ink-400 line-clamp-2 leading-relaxed">
                    {challenge.description || "Tidak ada deskripsi."}
                  </p>
                </div>

                {/* Progress bar if joined */}
                {isJoined && joinedInfo.challenge.progress && (
                  <div className="space-y-1.5 bg-paper-50 p-2.5 rounded border border-paper-100">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-ink-700">
                      <span>Progres</span>
                      <span>
                        {joinedInfo.challenge.progress.currentValue} / {joinedInfo.challenge.progress.targetValue}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-paper-200 overflow-hidden">
                      <div
                        className="h-full bg-moss-700 rounded-full transition-all duration-500"
                        style={{ width: `${joinedInfo.challenge.progress.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer specs */}
                <div className="border-t border-paper-100 pt-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-ink-400 font-semibold uppercase tracking-wider">Reward</p>
                    <p className="font-display font-bold text-moss-700 text-sm">
                      +{challenge.pointReward} Pts
                    </p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-[10px] text-ink-400 font-semibold uppercase tracking-wider">Deadline</p>
                    <p className="font-mono text-ink-900 font-semibold">
                      {formatDate(challenge.endDate)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/challenge/${challenge.id}`}
                    className="flex-1 text-center rounded-md border border-paper-200 py-2 text-xs font-semibold text-ink-700 hover:bg-paper-50 transition"
                  >
                    Detail
                  </Link>
                  {!isJoined ? (
                    <button
                      disabled={joinMutation.isPending}
                      onClick={() => handleJoin(challenge.id)}
                      className="flex-1 rounded-md bg-moss-700 py-2 text-xs font-semibold text-paper-50 hover:bg-moss-900 transition"
                    >
                      {joinMutation.isPending ? "Proses..." : "Gabung"}
                    </button>
                  ) : joinedInfo.status !== "COMPLETED" ? (
                    <Link
                      href="/activity/new"
                      className="flex-1 text-center rounded-md bg-moss-905 py-2 text-xs font-semibold text-paper-50 hover:bg-moss-950 transition"
                    >
                      Lapor Aksi
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
