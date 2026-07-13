"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { Medal, Star } from "lucide-react";

export function EcoChampions() {
  const { user } = useAuth();
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any>("/api/leaderboard")
      .then((res) => {
        if (res.data && res.data.topUsers && res.data.topUsers.length > 0) {
          // Explicitly sort by totalPoint descending
          const sortedUsers = [...res.data.topUsers].sort((a, b) => (b.totalPoint || 0) - (a.totalPoint || 0));
          setTopUsers(sortedUsers);
          setUserRank(res.data.userRank);
          setUserPoints(res.data.userPoints);
        } else {
          setTopUsers([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load leaderboard data", err);
        setTopUsers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <section className="py-[88px] bg-brand-paper-3 font-sans text-brand-text">
        <div className="max-w-[1180px] mx-auto px-8 md:px-10">
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-gold-deep flex items-center justify-center gap-2">
              <span className="inline-block w-[22px] h-[1px] bg-brand-gold-deep" />
              Juara Lingkungan
            </p>
            <h2 className="font-display text-3xl font-semibold text-brand-text leading-tight">
              Eco Champions Pekan Ini
            </h2>
            <p className="font-body text-[15px] text-brand-text-soft">
              Apresiasi bagi pejuang dengan kontribusi aksi hijau dan perolehan poin tertinggi minggu ini.
            </p>
          </div>
          <div className="text-center py-16 bg-brand-paper rounded-2xl border border-brand-line max-w-2xl mx-auto mb-8 shadow-xs animate-pulse">
            <p className="font-body text-[15px] text-brand-text-soft">
              Memuat data leaderboard...
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Construct podium order logically
  const podium: any[] = [];
  if (topUsers[0]) podium.push({ ...topUsers[0], rank: 1, medal: <Medal className="w-7 h-7" />, medalBg: "bg-amber-100 text-amber-800 ring-1 ring-amber-400" });
  if (topUsers[1]) podium.push({ ...topUsers[1], rank: 2, medal: <Medal className="w-6 h-6" />, medalBg: "bg-slate-200 text-slate-800" });
  if (topUsers[2]) podium.push({ ...topUsers[2], rank: 3, medal: <Medal className="w-6 h-6" />, medalBg: "bg-amber-200 text-amber-900" });

  const remaining = topUsers.slice(3);

  return (
    <section className="py-[88px] bg-brand-paper-3 font-sans text-brand-text">
      <div className="max-w-[1180px] mx-auto px-8 md:px-10">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-gold-deep flex items-center justify-center gap-2">
            <span className="inline-block w-[22px] h-[1px] bg-brand-gold-deep" />
            Juara Lingkungan
          </p>
          <h2 className="font-display text-3xl font-semibold text-brand-text leading-tight">
            Eco Champions Pekan Ini
          </h2>
          <p className="font-body text-[15px] text-brand-text-soft">
            Apresiasi bagi pejuang dengan kontribusi aksi hijau dan perolehan poin tertinggi minggu ini.
          </p>
        </div>

        {topUsers.length === 0 ? (
          <div className="text-center py-16 bg-brand-paper rounded-2xl border border-brand-line max-w-2xl mx-auto mb-8 shadow-xs">
            <p className="font-body text-[15px] text-brand-text-soft">
              Belum ada leaderboardnya
            </p>
          </div>
        ) : (
          <>
            {/* Podium Layout */}
            <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-16 max-w-3xl mx-auto pt-8">
              {podium.map((usr) => {
                const isFirst = usr.rank === 1;
                const isSecond = usr.rank === 2;
                const isThird = usr.rank === 3;

                // Order: Mobile -> 1, 2, 3 | Desktop -> 2, 1, 3
                let orderClass = "";
                if (isFirst) orderClass = "order-1 md:order-2";
                if (isSecond) orderClass = "order-2 md:order-1";
                if (isThird) orderClass = "order-3 md:order-3";

                return (
                  <div
                    key={usr.id || usr.username}
                    className={`rounded-2xl bg-brand-paper p-6 text-center border flex flex-col justify-between items-center w-full md:w-1/3 relative transition-all duration-300 hover:-translate-y-2 ${orderClass} ${isFirst
                        ? "border-brand-gold shadow-md ring-2 ring-brand-gold/20 md:min-h-[350px] z-10 md:-translate-y-6"
                        : "border-brand-line shadow-sm md:min-h-[290px]"
                      }`}
                  >
                    {/* Medal Icon inside stamp circle */}
                    <div className={`w-12 h-12 rounded-full ${usr.medalBg} flex items-center justify-center text-2xl mb-4 font-mono shadow-xs`}>
                      {usr.medal}
                    </div>

                    {/* Avatar */}
                    <div
                      className={`mx-auto rounded-full overflow-hidden bg-brand-paper-2 border flex items-center justify-center mb-4 ${isFirst ? "h-22 w-22 border-brand-gold" : "h-18 w-18 border-brand-line"
                        }`}
                    >
                      {usr.profileImageUrl ? (
                        <img loading="lazy" decoding="async" src={usr.profileImageUrl} alt={usr.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className={`font-display font-bold text-brand-forest ${isFirst ? "text-2xl" : "text-xl"}`}>
                          {usr.name ? usr.name[0] : "?"}
                        </span>
                      )}
                    </div>

                    {/* Profile Details */}
                    <div className="space-y-1">
                      <h4 className="font-display text-base font-semibold text-brand-text leading-snug">{usr.name}</h4>
                      <p className="font-mono text-[11px] text-brand-text-soft">@{usr.username || "user"}</p>
                    </div>

                    <div className="mt-5 border-t border-brand-line pt-3.5 w-full">
                      <p className="font-display text-xl font-bold text-brand-forest">
                        <span className="font-mono">{usr.totalPoint.toLocaleString("id-ID")}</span>{" "}
                        <span className="font-sans text-xs font-normal text-brand-text-soft">Pts</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Remaining Ranks List */}
            {remaining.length > 0 && (
              <div className="bg-brand-paper rounded-2xl border border-brand-line p-5 divide-y divide-brand-line max-w-2xl mx-auto mb-8 shadow-xs">
                {remaining.map((usr, idx) => {
                  const rankNum = idx + 4;
                  return (
                    <div
                      key={usr.id || usr.username}
                      className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0 font-sans"
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank Num */}
                        <span className="w-6 font-mono text-xs font-extrabold text-brand-text-soft text-center">
                          #{rankNum}
                        </span>

                        {/* Mini Avatar */}
                        <div className="h-9 w-9 rounded-full overflow-hidden bg-brand-paper-2 border border-brand-line flex items-center justify-center shrink-0">
                          {usr.profileImageUrl ? (
                            <img loading="lazy" decoding="async" src={usr.profileImageUrl} alt={usr.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="font-display text-sm font-semibold text-brand-forest">
                              {usr.name ? usr.name[0] : "?"}
                            </span>
                          )}
                        </div>

                        <div className="text-left leading-tight">
                          <p className="text-sm font-semibold text-brand-text">{usr.name}</p>
                          <p className="font-mono text-[10px] text-brand-text-soft">@{usr.username || "user"}</p>
                        </div>
                      </div>

                      <p className="font-mono text-xs font-bold text-brand-forest shrink-0">
                        {usr.totalPoint.toLocaleString("id-ID")} Pts
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* User Rank Status */}
            {user && userRank !== null && (
              <div className="rounded-xl border border-brand-line bg-brand-paper-2 p-5 flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-brand-gold-deep fill-brand-gold" />
                  <div className="text-left">
                    <h4 className="font-display font-semibold text-brand-text text-sm">Peringkat Anda</h4>
                    <p className="text-xs text-brand-text-soft mt-0.5">Kumpulkan poin lebih banyak untuk masuk ke 3 besar pejuang teratas.</p>
                  </div>
                </div>
                <div className="text-center sm:text-right font-mono shrink-0">
                  <p className="text-xl font-bold text-brand-forest">#{userRank}</p>
                  <p className="text-[11px] text-brand-text-soft font-semibold">{userPoints?.toLocaleString("id-ID")} Pts</p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-center">
          <Link
            href={user ? "/challenge" : "/login"}
            className="inline-block px-6 py-3 rounded-md bg-brand-forest hover:bg-brand-forest-2 text-white text-xs font-bold tracking-wide transition duration-200 shadow-xs"
          >
            Lihat Leaderboard Lengkap
          </Link>
        </div>
      </div>
    </section>
  );
}
