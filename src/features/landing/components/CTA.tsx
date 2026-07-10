"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export function CTA() {
  const { user } = useAuth();

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-tr from-moss-900 via-moss-800 to-moss-950 text-white font-sans">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-moss-600/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-ochre-400/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
          Siap Memulai Aksi Hijau?
        </h2>
        <p className="text-lg md:text-xl text-paper-100/90 leading-relaxed max-w-2xl mx-auto font-medium">
          Gabung bersama ribuan pengguna yang telah berkontribusi menjaga lingkungan dan mengumpulkan reward.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="px-8 py-4 rounded-xl font-bold text-base bg-[#fbbc04] hover:bg-[#e3aa04] text-gray-900 transition duration-300 shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            Mulai Sekarang
          </Link>
          <Link
            href="/marketplace"
            className="px-8 py-4 rounded-xl font-bold text-base bg-white/10 text-white border border-white/20 hover:bg-white/20 transition duration-300 flex items-center justify-center"
          >
            Jelajahi Marketplace
          </Link>
        </div>
      </div>
    </section>
  );
}
