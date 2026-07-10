"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

export function EcoChampions() {
  const { user } = useAuth();
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback top users
  const dummyUsers = [
    { name: "Gavriel", totalPoint: 2450, username: "gavriel" },
    { name: "Hana", totalPoint: 2180, username: "hana" },
    { name: "Feli", totalPoint: 1960, username: "feli" },
    { name: "Dimas", totalPoint: 1720, username: "dimas" },
    { name: "Rina", totalPoint: 1540, username: "rina" },
  ];

  useEffect(() => {
    apiFetch<any>("/api/leaderboard")
      .then((res) => {
        if (res.data && res.data.topUsers && res.data.topUsers.length > 0) {
          setTopUsers(res.data.topUsers);
          setUserRank(res.data.userRank);
          setUserPoints(res.data.userPoints);
        } else {
          setTopUsers(dummyUsers);
        }
      })
      .catch((err) => {
        console.error("Failed to load leaderboard data", err);
        setTopUsers(dummyUsers);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  // Construct podium order (2nd place on left, 1st in center, 3rd on right)
  const podium: any[] = [];
  if (topUsers[1]) podium.push({ ...topUsers[1], rank: 2, medal: "🥈", badgeColor: "bg-slate-100 text-slate-700" });
  if (topUsers[0]) podium.push({ ...topUsers[0], rank: 1, medal: "🥇", badgeColor: "bg-ochre-100 text-ochre-700 ring-2 ring-ochre-400" });
  if (topUsers[2]) podium.push({ ...topUsers[2], rank: 3, medal: "🥉", badgeColor: "bg-amber-100 text-amber-800" });

  const remaining = topUsers.slice(3);

  return (
    <section className="py-20 bg-[#F2F6F0] font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold tracking-widest text-moss-700 uppercase">
            Leaderboard
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
            Eco Champions Pekan Ini
          </h3>
          <p className="text-sm text-ink-400">
            Apresiasi bagi pejuang lingkungan dengan kontribusi aksi hijau dan poin terbanyak minggu ini.
          </p>
        </div>

        {/* Podium Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
          {podium.map((usr) => {
            const isFirst = usr.rank === 1;
            return (
              <div
                key={usr.id || usr.username}
                className={`rounded-3xl bg-white border border-paper-200 p-6 text-center shadow-xs transition duration-300 hover:-translate-y-1 flex flex-col justify-between items-center ${
                  isFirst
                    ? "md:min-h-[360px] border-[#fbbc04] shadow-md ring-2 ring-[#fbbc04]/20 order-1 md:order-2"
                    : usr.rank === 2
                    ? "md:min-h-[310px] order-2 md:order-1"
                    : "md:min-h-[310px] order-3"
                }`}
              >
                {/* Medal Icon */}
                <div className="text-4xl mb-2">{usr.medal}</div>

                {/* Large Avatar */}
                <div
                  className={`mx-auto rounded-full overflow-hidden bg-moss-50 border flex items-center justify-center mb-4 ${
                    isFirst ? "h-24 w-24 border-ochre-400 shadow-sm" : "h-20 w-20 border-paper-200"
                  }`}
                >
                  {usr.profileImageUrl ? (
                    <img src={usr.profileImageUrl} alt={usr.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className={`font-bold text-moss-700 ${isFirst ? "text-3xl" : "text-2xl"}`}>
                      {usr.name ? usr.name[0] : "?"}
                    </span>
                  )}
                </div>

                {/* Profile Details */}
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-ink-900 leading-snug">{usr.name}</h4>
                  <p className="text-xs text-ink-400 font-mono">@{usr.username || "user"}</p>
                </div>

                <div className={`mt-3 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${usr.badgeColor}`}>
                  {usr.rank === 1 ? "Eco Legend" : usr.rank === 2 ? "Green Hero" : "Eco Master"}
                </div>

                <div className="mt-5 border-t border-paper-100 pt-3.5 w-full">
                  <p className="text-xl font-extrabold text-moss-700 font-mono">
                    {usr.totalPoint.toLocaleString("id-ID")}{" "}
                    <span className="text-xs font-normal text-ink-400 font-sans">Pts</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Remaining Ranks List */}
        {remaining.length > 0 && (
          <div className="bg-white rounded-3xl border border-paper-200/60 p-5 divide-y divide-paper-100 mb-8 shadow-xs">
            {remaining.map((usr, idx) => {
              const rankNum = idx + 4;
              return (
                <div
                  key={usr.id || usr.username}
                  className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Num */}
                    <span className="w-6 font-mono text-sm font-extrabold text-ink-400 text-center">
                      #{rankNum}
                    </span>

                    {/* Mini Avatar */}
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-moss-50 border border-paper-200 flex items-center justify-center shrink-0">
                      {usr.profileImageUrl ? (
                        <img src={usr.profileImageUrl} alt={usr.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-moss-700">
                          {usr.name ? usr.name[0] : "?"}
                        </span>
                      )}
                    </div>

                    <div className="text-left leading-tight">
                      <p className="text-sm font-bold text-ink-900">{usr.name}</p>
                      <p className="text-[10px] text-ink-400 font-mono">@{usr.username || "user"}</p>
                    </div>
                  </div>

                  <p className="font-mono text-sm font-bold text-moss-700 shrink-0">
                    {usr.totalPoint.toLocaleString("id-ID")} Pts
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* User Rank Status */}
        {user && userRank !== null && (
          <div className="rounded-2xl border border-moss-200 bg-moss-50/50 p-5 flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⭐</span>
              <div className="text-left">
                <h4 className="font-bold text-ink-900 text-sm">Peringkat Anda</h4>
                <p className="text-xs text-ink-400">Kumpulkan poin lebih banyak untuk masuk ke 3 besar pejuang teratas!</p>
              </div>
            </div>
            <div className="text-center sm:text-right font-mono">
              <p className="text-2xl font-black text-moss-700">#{userRank}</p>
              <p className="text-xs text-ink-400 font-semibold">{userPoints?.toLocaleString("id-ID")} Pts</p>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link
            href={user ? "/challenge" : "/login"}
            className="inline-block px-8 py-3.5 rounded-xl bg-moss-700 hover:bg-moss-900 text-paper-50 text-xs font-bold tracking-wide transition duration-300 shadow-sm"
          >
            Lihat Leaderboard Lengkap
          </Link>
        </div>
      </div>
    </section>
  );
}
