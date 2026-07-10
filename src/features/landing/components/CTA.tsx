"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export function CTA() {
  const { user } = useAuth();

  return (
    <section className="py-[88px] relative overflow-hidden bg-gradient-to-tr from-brand-ink via-brand-forest to-brand-forest-2 text-white font-sans">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-brand-forest-2/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-brand-moss/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-[1180px] mx-auto px-8 md:px-10 text-center space-y-6 relative z-10">
        <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
          Siap Memulai Aksi Hijau?
        </h2>
        <p className="font-body text-[15px] text-brand-moss-light leading-relaxed max-w-xl mx-auto font-medium">
          Gabung bersama ribuan pengguna yang telah berkontribusi menjaga lingkungan dan mengumpulkan reward.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="px-6 py-3.5 rounded-md font-bold text-sm bg-brand-gold hover:bg-brand-gold-deep text-brand-text transition duration-200 hover:-translate-y-0.5 shadow-xs flex items-center justify-center"
          >
            Mulai Sekarang
          </Link>
          <Link
            href="/marketplace"
            className="px-6 py-3.5 rounded-md font-bold text-sm bg-white/10 text-white border border-white/20 hover:bg-white/20 transition duration-200 hover:-translate-y-0.5 flex items-center justify-center"
          >
            Jelajahi Marketplace
          </Link>
        </div>
      </div>
    </section>
  );
}
