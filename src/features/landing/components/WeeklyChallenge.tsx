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
    description: "Kumpulkan dan daur ulang botol plastik di lingkungan sekitarmu.",
    icon: "♻️",
    targetValue: 5,
    currentValue: 4,
    points: 100,
    deadlineText: "2 Hari Lagi (12 Jul 2026)",
  };

  useEffect(() => {
    // Attempt to load dynamic challenges
    apiFetch<any>("/api/challenge/my")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          // Add dummy fields for countdown if not present
          const formatted = res.data.map((c: any) => ({
            ...c,
            deadlineText: c.deadlineText || "5 Hari Lagi",
          }));
          setChallenges(formatted);
        } else {
          setChallenges([dummyChallenge]);
        }
      })
      .catch(() => {
        setChallenges([dummyChallenge]);
      });
  }, [user]);

  return (
    <section className="py-20 md:py-24 bg-[#FAF7F0] font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold tracking-widest text-moss-700 uppercase">
            Misi Mingguan
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
            Challenge Terbuka Minggu Ini
          </h3>
          <p className="text-sm text-ink-400">
            Selesaikan tantangan berikut sebelum batas waktu habis, dapatkan bonus poin instan, dan percepat kenaikan level dampak lingkunganmu!
          </p>
        </div>

        {/* Challenge Cards list */}
        <div className="space-y-6">
          {challenges.map((ch, idx) => {
            const current = ch.currentValue ?? 4;
            const target = ch.targetValue ?? 5;
            const percent = Math.min(100, Math.round((current / target) * 100));
            const deadline = ch.deadlineText || "Terbatas";

            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 md:p-8 border border-paper-200/60 flex flex-col md:flex-row justify-between items-stretch gap-6 shadow-sm hover:shadow-md transition duration-300 relative overflow-hidden"
              >
                {/* Visual badge top right */}
                <div className="absolute top-0 right-0 bg-moss-700 text-paper-50 text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                  Tantangan Aktif
                </div>

                <div className="flex gap-5 items-start flex-1 text-left">
                  <div className="text-4xl p-4 bg-paper-50 border border-paper-200 rounded-2xl shrink-0">
                    {ch.icon || "♻️"}
                  </div>
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-ink-900 leading-snug">{ch.title}</h3>
                      <p className="text-xs text-ink-400 leading-relaxed">{ch.description}</p>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="space-y-1.5 max-w-md">
                      <div className="flex justify-between items-center text-xs font-bold text-ink-700">
                        <span className="text-moss-700 flex items-center gap-1">Progres Aksi: <span className="font-mono">{current}/{target}</span></span>
                        <span className="font-mono text-moss-800">{percent}%</span>
                      </div>
                      <div className="w-full bg-paper-100 h-3 rounded-full overflow-hidden border border-paper-200/50">
                        <div
                          className="bg-gradient-to-r from-moss-500 to-moss-700 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Deadline tag */}
                    <div className="inline-flex items-center gap-1 bg-ochre-50/50 border border-ochre-200/30 text-ochre-700 px-3 py-1 rounded-lg text-[11px] font-bold">
                      ⏱️ Batas Waktu: {deadline}
                    </div>
                  </div>
                </div>

                {/* Right side Points & CTA */}
                <div className="flex flex-col justify-between items-center md:items-end gap-4 w-full md:w-auto border-t md:border-t-0 border-paper-100 pt-5 md:pt-0 shrink-0">
                  <div className="text-center md:text-right space-y-0.5">
                    <p className="text-[10px] text-ink-400 uppercase tracking-widest font-bold">Bonus Hadiah</p>
                    <p className="text-3xl font-black text-moss-700 font-mono tracking-tight flex items-center justify-center md:justify-end gap-1">
                      <span>🪙</span>
                      <span>+{ch.points || 100}</span>
                      <span className="text-xs font-bold text-ink-400 font-sans uppercase">Pts</span>
                    </p>
                  </div>
                  <Link
                    href={user ? "/activity/new" : "/login"}
                    className="w-full md:w-auto text-center px-6 py-3 bg-moss-700 hover:bg-moss-900 text-white text-xs font-bold rounded-xl shadow-xs transition duration-300"
                  >
                    Ikuti Challenge
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
