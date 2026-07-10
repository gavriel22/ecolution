"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export function Hero() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden flex items-center justify-center py-20 md:py-32" style={{ backgroundImage: 'url("/landing.jpg")' }}>
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10 md:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6 md:space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-md">
              Aksi Hijau Nyata,<br />
              <span className="text-[#fbbc04]">Dapatkan Poin Reward!</span>
            </h1>
            <p className="text-lg md:text-xl text-paper-50/90 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed drop-shadow-sm">
              Lapor aktivitas daur ulang sampahmu secara otomatis dengan foto berbasis GPS. Tukar poin dengan voucher belanja di marketplace UMKM lokal kami.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link
                href={user ? "/dashboard" : "/register"}
                className="px-8 py-4 bg-[#fbbc04] hover:bg-[#e3aa04] text-gray-900 font-bold rounded-xl transition duration-300 shadow-lg hover:scale-[1.02] text-base"
              >
                Mulai Sekarang
              </Link>
              <Link
                href="/marketplace"
                className="px-8 py-4 bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/25 text-white font-bold rounded-xl transition duration-300 shadow-md hover:scale-[1.02] text-base"
              >
                Marketplace
              </Link>
            </div>
          </div>

          {/* Right Column: Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[400px]">
              {/* Decorative backgrounds */}
              <div className="absolute inset-0 bg-gradient-to-tr from-moss-500 to-[#fbbc04] rounded-[40px] rotate-3 opacity-30 blur-2xl"></div>

              {/* Premium Phone-like Mockup Card */}
              <div className="relative bg-white/95 backdrop-blur-lg text-ink-900 rounded-[36px] overflow-hidden shadow-2xl p-6 flex flex-col justify-between font-sans border border-paper-200/50 aspect-[9/13]">
                {/* Header Mockup */}
                <div className="flex items-center justify-between border-b border-paper-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌱</span>
                    <div className="text-left">
                      <h3 className="font-bold text-sm text-ink-900 leading-tight">Ecolution</h3>
                      <p className="text-[10px] text-ink-400 font-medium">Aksi &amp; Dampak Hijau</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-moss-100 text-moss-700 text-xs font-bold rounded-full">Level 4</span>
                </div>

                {/* Score Circular / Large Stat mockup */}
                <div className="my-4 text-center py-2">
                  <div className="inline-block relative">
                    <div className="w-24 h-24 rounded-full border-4 border-moss-200 flex items-center justify-center flex-col bg-moss-50/30">
                      <span className="text-xl font-black text-moss-700">98%</span>
                      <span className="text-[9px] text-ink-400 uppercase tracking-widest font-semibold">Trust</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-ink-400 mt-2 font-medium">Skor Kepercayaan Kamu Tergolong Sangat Tinggi!</p>
                </div>

                {/* Stats Mockup */}
                <div className="grid grid-cols-2 gap-3 my-2 text-center">
                  <div className="bg-moss-50/50 p-3 rounded-2xl border border-moss-100/50">
                    <p className="text-[9px] text-moss-700 font-bold uppercase tracking-wider">Total Poin</p>
                    <p className="text-base font-extrabold text-moss-900 mt-0.5">2,450 Pts</p>
                  </div>
                  <div className="bg-ochre-50/20 p-3 rounded-2xl border border-ochre-200/30">
                    <p className="text-[9px] text-ochre-700 font-bold uppercase tracking-wider">Aksi Hijau</p>
                    <p className="text-base font-extrabold text-ochre-800 mt-0.5">48 Aksi</p>
                  </div>
                </div>

                {/* Progress Mockup */}
                <div className="bg-paper-50 p-3.5 rounded-2xl border border-paper-100 space-y-2 text-left">
                  <div className="flex justify-between items-center text-[10px] sm:text-xs">
                    <span className="font-bold text-ink-800">♻️ Misi Daur Ulang</span>
                    <span className="font-mono text-moss-700 font-bold">4 / 5 Botol</span>
                  </div>
                  <div className="w-full bg-paper-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-moss-700 h-full rounded-full" style={{ width: "80%" }}></div>
                  </div>
                  <p className="text-[9px] text-ink-400 font-medium text-right">+100 Poin reward jika selesai</p>
                </div>

                {/* Button Mockup */}
                <Link href={user ? "/activity/new" : "/login"} className="bg-moss-700 text-white text-center py-2.5 rounded-xl font-semibold text-xs shadow-md hover:bg-moss-900 transition-colors block mt-2">
                  + Lapor Aksi Hijau Baru
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
