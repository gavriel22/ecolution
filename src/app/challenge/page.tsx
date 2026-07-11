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
import { Recycle, Clock, Coins, Search } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function ChallengesPage() {
  const confirm = useConfirm();
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const { data: challenges = [], isLoading: isLoadingList } = useChallenges({ search: search || undefined });
  const { data: myChallenges = [], isLoading: isLoadingMy } = useMyChallenges();
  const joinMutation = useJoinChallenge();

  const handleJoin = async (challengeId: string) => {
    if (!user) {
      router.push("/login?callbackUrl=/challenge");
      return;
    }
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
    <div className="bg-[#F8F9FA] min-h-screen pb-12">
      {/* Hero Section */}
      <div className="relative border-b border-brand-line pt-32 pb-16 overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/landing.jpg"
            alt="Challenge Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#e6eedd] via-[#e6eedd]/90 to-[#e6eedd]/50" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-4xl lg:max-w-5xl">
              <h1 className="font-display text-4xl sm:text-5xl font-black text-brand-text tracking-tight mb-3">
                Challenge
              </h1>
              <p className="font-body text-base text-brand-text-soft leading-relaxed lg:whitespace-nowrap">
                Selesaikan berbagai challenge lingkungan, kumpulkan poin, dan tukarkan dengan reward menarik.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-30">
        {/* Filter and Search Bar */}
        <div className="rounded-xl border border-brand-line bg-white p-2 sm:p-4 shadow-sm flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari challenge..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-brand-line bg-[#F8F9FA] pl-11 pr-4 py-3 text-sm text-brand-text outline-none focus:border-brand-forest focus:ring-1 focus:ring-brand-forest font-semibold placeholder:font-normal"
            />
            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-brand-text-soft" />
          </div>
        </div>

        {isLoadingList || isLoadingMy ? (
          /* Skeletons */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col md:flex-row rounded-xl border border-brand-line bg-white shadow-sm h-[200px]">
                <div className="flex-1 p-6 md:p-8 space-y-4">
                  <div className="h-6 w-3/4 rounded bg-brand-line/50" />
                  <div className="h-4 w-1/2 rounded bg-brand-line/50" />
                  <div className="h-10 w-full rounded bg-brand-line/50 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : challenges.length === 0 ? (
          /* Empty State */
          <div className="rounded-xl border border-dashed border-brand-line bg-white p-16 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-brand-paper rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-brand-text-soft opacity-50" />
            </div>
            <h3 className="font-display text-2xl font-bold text-brand-text mb-2">Tantangan Tidak Ditemukan</h3>
            <p className="font-body text-base text-brand-text-soft">Tidak ada tantangan aktif saat ini yang cocok dengan pencarian Anda.</p>
          </div>
        ) : (
          /* Challenges Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {challenges.map((challenge) => {
              const joinedInfo = getJoinedStatus(challenge.id);
              const isJoined = !!joinedInfo;
              const progress = joinedInfo?.challenge.progress;
              const current = progress?.currentValue || 0;
              const target = progress?.targetValue || 1;
              const percent = Math.min(100, Math.round((current / target) * 100));

              return (
                <div
                  key={challenge.id}
                  className={`flex flex-col md:flex-row bg-white rounded-xl border ${isJoined && joinedInfo.status === 'COMPLETED' ? 'border-brand-forest/50 bg-brand-forest/5' : 'border-brand-line'} overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group`}
                >
                  {/* Left side: Main Content */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-brand-forest bg-brand-paper px-2 py-0.5 rounded-md border border-brand-line">
                            {challenge.category?.name || "Aksi"}
                          </span>
                          {isJoined && (
                            <span className={`font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${joinedInfo.status === "COMPLETED"
                              ? "bg-brand-forest text-white border-brand-forest"
                              : "bg-brand-gold/20 text-brand-gold-deep border-brand-gold/30"
                              }`}>
                              {joinedInfo.status === "COMPLETED" ? "Selesai" : "Diikuti"}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg font-bold text-brand-text leading-snug">
                          <Link href={`/challenge/${challenge.id}`} className="hover:text-brand-forest transition-colors">
                            {challenge.title}
                          </Link>
                        </h3>
                        <p className="font-body text-[13.5px] text-brand-text-soft leading-relaxed mt-1 line-clamp-2">
                          {challenge.description || "Tidak ada deskripsi."}
                        </p>
                      </div>
                      <span className="hidden sm:flex items-center justify-center w-14 h-14 shrink-0 bg-brand-paper-2 rounded-xl border border-brand-line text-brand-forest">
                        <Recycle className="w-8 h-8" strokeWidth={1.5} />
                      </span>
                    </div>

                    <div className="mt-6 space-y-4">
                      {/* Progress Bar (if joined) */}
                      {isJoined && progress && (
                        <div className="space-y-1.5 max-w-md">
                          <div className="flex justify-between items-center text-xs font-bold text-brand-text">
                            <span className="font-mono">Progress: {current} / {target}</span>
                            <span className="font-mono">{percent}%</span>
                          </div>
                          <div className="w-full bg-brand-paper-3 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-brand-forest h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Perforation Line */}
                  <div className="hidden md:flex flex-col justify-between py-2 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F8F9FA] -mt-3.5 -ml-1 border-b border-r border-brand-line"></div>
                    <div className="flex-1 border-r-2 border-dashed border-brand-line my-1"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F8F9FA] -mb-3.5 -ml-1 border-t border-r border-brand-line"></div>
                  </div>

                  {/* Right side: Coupon Reward & Button */}
                  <div className="w-full md:w-[220px] bg-brand-paper-3/40 p-6 md:p-8 flex flex-col justify-between items-center text-center shrink-0 border-t md:border-t-0 border-brand-line">
                    <div className="space-y-1">
                      <p className="font-mono text-[9px] text-brand-text-soft font-bold uppercase tracking-widest">
                        Kupon Hadiah
                      </p>
                      <p className="font-display text-2xl font-semibold text-brand-forest flex items-center justify-center gap-1.5">
                        <Coins className="w-6 h-6 text-brand-gold-deep" /> +{challenge.pointReward}
                        <span className="font-sans text-xs font-normal text-brand-text-soft">Pts</span>
                      </p>
                    </div>

                    <div className="w-full mt-4 space-y-2">
                      {!isJoined ? (
                        <button
                          disabled={joinMutation.isPending}
                          onClick={() => handleJoin(challenge.id)}
                          className="w-full py-2.5 rounded-xl bg-brand-forest hover:bg-brand-forest-2 text-white font-bold text-xs text-center transition-all duration-200 hover:-translate-y-0.5 shadow-sm disabled:opacity-50 disabled:transform-none"
                        >
                          {joinMutation.isPending ? "Proses..." : "Gabung Challenge"}
                        </button>
                      ) : joinedInfo.status !== "COMPLETED" ? (
                        <Link
                          href="/activity/new"
                          className="block w-full py-2.5 rounded-xl bg-brand-gold hover:bg-brand-gold-deep text-brand-text font-bold text-xs text-center transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                        >
                          Lapor Aksi
                        </Link>
                      ) : (
                        <Link
                          href={`/challenge/${challenge.id}`}
                          className="block w-full py-2.5 rounded-xl border-2 border-brand-line bg-white hover:bg-[#F8F9FA] text-brand-text font-bold text-xs text-center transition-colors"
                        >
                          Lihat Detail
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
