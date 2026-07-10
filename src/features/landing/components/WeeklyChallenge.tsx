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
    deadlineText: "12 Jul 2026",
    code: "CH-001",
  };

  useEffect(() => {
    apiFetch<any>("/api/challenge/my")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const formatted = res.data.map((c: any, index: number) => ({
            ...c,
            deadlineText: c.deadlineText || "15 Jul 2026",
            code: c.code || `CH-00${index + 1}`,
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
    <section className="py-[88px] bg-brand-paper-2 font-sans">
      <div className="max-w-[1180px] mx-auto px-8 md:px-10">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-gold-deep flex items-center justify-center gap-2">
            <span className="inline-block w-[22px] h-[1px] bg-brand-gold-deep" />
            Tiket Misi
          </p>
          <h2 className="font-display text-3xl font-semibold text-brand-text leading-tight">
            Tantangan Berbatas Waktu
          </h2>
          <p className="font-body text-[15px] text-brand-text-soft">
            Selesaikan misi berikut sebelum batas waktu habis untuk mendapatkan stempel poin tambahan.
          </p>
        </div>

        {/* Challenge Cards list */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {challenges.map((ch, idx) => {
            const current = ch.currentValue ?? 4;
            const target = ch.targetValue ?? 5;
            const percent = Math.min(100, Math.round((current / target) * 100));
            const deadline = ch.deadlineText || "Terbatas";
            const code = ch.code || `CH-00${idx + 1}`;

            return (
              <div
                key={idx}
                className="bg-brand-paper rounded-2xl border border-brand-line overflow-hidden flex flex-col md:flex-row shadow-xs transition duration-300"
              >
                {/* Left side: Ticket Details */}
                <div className="flex-1 p-6 md:p-8 space-y-4 text-left">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <p className="font-mono text-[10px] text-brand-gold-deep font-bold tracking-wider uppercase">
                        KODE: {code}
                      </p>
                      <h3 className="font-display text-lg font-bold text-brand-text leading-snug">
                        {ch.title}
                      </h3>
                      <p className="font-body text-[13.5px] text-brand-text-soft leading-relaxed">
                        {ch.description}
                      </p>
                    </div>
                    <span className="text-3xl shrink-0 p-3 bg-brand-paper-2 rounded-xl border border-brand-line">
                      {ch.icon || "♻️"}
                    </span>
                  </div>

                  {/* Progress Bar */}
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

                  {/* Deadline text */}
                  <div className="inline-flex items-center gap-1.5 bg-brand-paper-2 px-3 py-1 rounded-lg text-[11px] text-brand-text-soft font-mono">
                    ⏱️ Batas Waktu: {deadline}
                  </div>
                </div>

                {/* Perforation Line */}
                <div className="hidden md:flex flex-col justify-between py-2 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-paper-2 -mt-3.5 -ml-1 border-b border-r border-brand-line"></div>
                  <div className="flex-1 border-r-2 border-dashed border-brand-line my-1"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-paper-2 -mb-3.5 -ml-1 border-t border-r border-brand-line"></div>
                </div>

                {/* Right side: Coupon Reward & Button */}
                <div className="w-full md:w-[220px] bg-brand-paper-3/40 p-6 md:p-8 flex flex-col justify-between items-center text-center shrink-0 border-t md:border-t-0 border-brand-line">
                  <div className="space-y-1">
                    <p className="font-mono text-[9px] text-brand-text-soft font-bold uppercase tracking-widest">
                      Kupon Hadiah
                    </p>
                    <p className="font-display text-2xl font-semibold text-brand-forest">
                      🪙 +{ch.points || 100}{" "}
                      <span className="font-sans text-xs font-normal text-brand-text-soft">Pts</span>
                    </p>
                  </div>

                  <Link
                    href={user ? "/activity/new" : "/login"}
                    className="w-full mt-4 py-2.5 rounded-md bg-brand-gold hover:bg-brand-gold-deep text-brand-text font-bold text-xs text-center transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
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
