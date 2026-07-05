"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";

export function WeeklyChallenge() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);

  const dummyChallenge = {
    title: "Daur Ulang Botol Plastik",
    description: "Kumpulkan dan daur ulang botol plastik untuk menyelamatkan bumi.",
    icon: "♻️",
    targetValue: 5,
    currentValue: 4,
    points: 100,
  };

  useEffect(() => {
    // Attempt to load dynamic challenges
    apiFetch<any>("/api/challenge/my")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setChallenges(res.data);
        } else {
          setChallenges([dummyChallenge]);
        }
      })
      .catch(() => {
        setChallenges([dummyChallenge]);
      });
  }, [user]);

  return (
    <section className="py-20 bg-white font-body border-t border-paper-200">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-display text-3xl font-extrabold text-ink-900">
            Challenge Minggu Ini
          </h2>
          <p className="text-sm text-ink-400 mt-2">Penuhi misi mingguan, dapatkan bonus poin instan, dan bantu hijaukan bumi!</p>
        </div>

        {/* Challenge Cards list */}
        <div className="space-y-6">
          {challenges.map((ch, idx) => {
            const current = ch.currentValue ?? 4;
            const target = ch.targetValue ?? 5;
            const percent = Math.min(100, Math.round((current / target) * 100));

            return (
              <div
                key={idx}
                className="bg-paper-50 rounded-3xl p-6 md:p-8 border border-paper-200 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xs hover:shadow-md transition"
              >
                <div className="flex gap-4 items-start w-full md:w-auto text-left">
                  <div className="text-4xl p-3 bg-white border border-paper-200 rounded-2xl">
                    {ch.icon || "♻️"}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-display text-lg font-bold text-ink-900">{ch.title}</h3>
                    <p className="text-xs text-ink-400 leading-relaxed max-w-md">{ch.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="pt-2 max-w-xs">
                      <div className="flex justify-between items-center text-xs font-bold text-moss-700 mb-1">
                        <span>Progress Misi</span>
                        <span>{current} / {target} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-paper-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-moss-700 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto border-t md:border-t-0 border-paper-200 pt-4 md:pt-0 shrink-0">
                  <div className="text-center md:text-right">
                    <p className="text-xs text-ink-400 uppercase tracking-wider font-semibold">Reward</p>
                    <p className="text-2xl font-black text-moss-800 font-mono">+{ch.points || 100} Pts</p>
                  </div>
                  <Link
                    href={user ? "/activity/new" : "/login"}
                    className="w-full md:w-auto text-center px-6 py-2.5 bg-[#fbbc04] hover:bg-[#e3aa04] text-gray-900 text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    Ikut Misi
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
