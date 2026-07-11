"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Leaf, Recycle } from "lucide-react";

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
              Mari Mulai Aksimu,<br />
              <span className="text-[#fbbc04]">Dapatkan Poin Reward!</span>
            </h1>
            <p className="text-lg md:text-xl text-paper-50/90 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed drop-shadow-sm">
              Laporkan aktivitas daur ulangmu dengan foto berbasis GPS. Kumpulkan poin dan tukarkan dengan voucher di marketplace UMKM lokal.
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
                Jelajahi Marketplace
              </Link>
            </div>
          </div>

          {/* Right Column: Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center mt-12 lg:mt-0">
            <div className="relative w-[240px] sm:w-[270px] aspect-[9/18]">
              {/* Decorative backgrounds */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-forest to-brand-gold rounded-[3rem] rotate-6 opacity-30 blur-2xl"></div>

              {/* Phone Frame */}
              <div className="relative w-full h-full bg-black rounded-[2rem] p-1.5 sm:p-2 shadow-2xl border-4 border-gray-800/80">
                {/* Screen */}
                <div className="relative w-full h-full bg-gray-900 rounded-[1.5rem] overflow-hidden">
                  {/* Camera Image */}
                  <img
                    src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=2070&auto=format&fit=crop"
                    alt="Aktivitas Lingkungan"
                    className="w-full h-full object-cover transition-transform duration-[10s] hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Minimal Camera UI Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                    {/* Top Notch/Dynamic Island */}
                    <div className="pt-2 flex justify-center">
                      <div className="w-20 h-5 bg-black rounded-full"></div>
                    </div>

                    {/* Viewfinder Brackets */}
                    <div className="absolute inset-x-6 top-20 bottom-24">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/60"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/60"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/60"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/60"></div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="pb-6 flex flex-col items-center">
                      <p className="text-white/80 text-[9px] font-mono tracking-widest mb-3 font-bold uppercase drop-shadow-md">Ambil Foto Aksi</p>
                      {/* Capture Button */}
                      <div className="w-14 h-14 rounded-full border-[3px] border-white/80 p-1 backdrop-blur-sm bg-black/10">
                        <div className="w-full h-full bg-white/90 rounded-full shadow-inner"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
