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
  const dummyTop3 = [
    { name: "Gavriel", totalPoint: 2450, username: "gavriel" },
    { name: "Hana", totalPoint: 2180, username: "hana" },
    { name: "Feli", totalPoint: 1960, username: "feli" },
  ];

  useEffect(() => {
    apiFetch<any>("/api/leaderboard")
      .then((res) => {
        if (res.data && res.data.topUsers && res.data.topUsers.length > 0) {
          setTopUsers(res.data.topUsers);
          setUserRank(res.data.userRank);
          setUserPoints(res.data.userPoints);
        } else {
          setTopUsers(dummyTop3);
        }
      })
      .catch((err) => {
        console.error("Failed to load leaderboard data", err);
        setTopUsers(dummyTop3);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const medals = ["🥇", "🥈", "🥉"];
  const badges = ["Eco Legend", "Green Hero", "Recycle Master"];

  return (
    <section className="py-20 bg-paper-50 font-body">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-display text-4xl font-extrabold text-ink-900 flex items-center justify-center gap-2">
            🏆 Eco Champions
          </h2>
          <p className="text-sm text-ink-400 mt-2">Pahlawan lingkungan dengan kontribusi dan poin tertinggi minggu ini.</p>
        </div>

        {/* Leaderboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {topUsers.map((usr, index) => (
            <div
              key={usr.id || usr.username}
              className={`rounded-3xl border p-6 text-center shadow-sm relative transition hover:-translate-y-1 ${
                index === 0
                  ? "bg-white border-[#fbbc04]/40 ring-2 ring-[#fbbc04]/20"
                  : "bg-white border-paper-200"
              }`}
            >
              {/* Medal Badge */}
              <div className="absolute top-4 left-4 text-2xl font-mono">
                {medals[index]}
              </div>

              {/* Avatar Mockup */}
              <div className="h-16 w-16 mx-auto rounded-full overflow-hidden bg-moss-50 border border-moss-100 flex items-center justify-center mb-4">
                {usr.profileImageUrl ? (
                  <img src={usr.profileImageUrl} alt={usr.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-moss-700">{usr.name ? usr.name[0] : "?"}</span>
                )}
              </div>

              {/* User Details */}
              <h3 className="font-display text-lg font-bold text-ink-900">{usr.name}</h3>
              <p className="text-xs text-ink-400 font-mono">@{usr.username || "user"}</p>
              
              <div className="mt-4 inline-block px-3 py-1 bg-moss-50 border border-moss-150 text-moss-700 rounded-full font-mono text-xs font-bold">
                {badges[index]}
              </div>

              <div className="mt-4 border-t border-paper-100 pt-3">
                <p className="text-2xl font-black text-moss-800 font-mono">
                  {usr.totalPoint.toLocaleString("id-ID")}{" "}
                  <span className="text-xs font-normal text-ink-400">Poin</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* User Rank Status */}
        {user && userRank !== null && (
          <div className="rounded-2xl border border-moss-200 bg-moss-50/50 p-5 flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⭐</span>
              <div className="text-left">
                <h4 className="font-bold text-ink-900 text-sm">Peringkat Anda saat ini</h4>
                <p className="text-xs text-ink-400">Terus kumpulkan poin untuk naik ke peringkat 3 teratas!</p>
              </div>
            </div>
            <div className="text-center sm:text-right font-mono">
              <p className="text-2xl font-black text-moss-800">#{userRank}</p>
              <p className="text-xs text-ink-400 font-semibold">{userPoints?.toLocaleString("id-ID")} Poin</p>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link
            href={user ? "/challenge" : "/login"}
            className="inline-block px-8 py-3 rounded-full bg-moss-700 hover:bg-moss-900 text-paper-50 text-xs font-bold tracking-wide transition shadow-md"
          >
            Lihat Leaderboard Lengkap
          </Link>
        </div>
      </div>
    </section>
  );
}
