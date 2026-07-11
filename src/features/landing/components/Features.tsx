"use client";

import { Camera, Gift, Trophy, Store, Sprout } from "lucide-react";

export function Features() {
  const steps = [
    {
      title: "Ambil Foto Aktivitas",
      description: "Potret aktivitas daur ulang sampahmu langsung dari kamera HP dengan GPS aktif.",
      icon: <Camera className="w-[22px] h-[22px] text-brand-forest" />,
    },
    {
      title: "Verifikasi Otomatis",
      description: "Sistem memverifikasi waktu, lokasi GPS, dan keaslian foto dalam hitungan detik.",
      icon: <Store className="w-[22px] h-[22px] text-brand-forest" />,
    },
    {
      title: "Dapatkan Koin Poin",
      description: "Setelah disetujui, kamu langsung mendapatkan koin poin reward sesuai dampak lingkungan aksimu.",
      icon: <Trophy className="w-[22px] h-[22px] text-brand-forest" />,
    },
    {
      title: "Tukarkan Voucher",
      description: "Tukarkan koin poinmu dengan voucher belanja digital gratis dari mitra UMKM lokal.",
      icon: <Gift className="w-[22px] h-[22px] text-brand-forest" />,
    },
  ];

  return (
    <section className="py-[88px] bg-brand-paper overflow-hidden font-sans">
      <div className="max-w-[1180px] mx-auto px-8 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column: Trail Stops */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-2 text-left">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-gold-deep flex items-center gap-2">
                <span className="inline-block w-[22px] h-[1px] bg-brand-gold-deep" />
                Alur Kontribusi
              </p>
              <h2 className="font-display text-3xl font-semibold text-brand-text leading-tight">
                Bagaimana Cara Kerja Ecolution?
              </h2>
              <p className="font-body text-[15px] text-brand-text-soft leading-relaxed max-w-xl">
                Ecolution mempermudah kamu menjaga bumi sekaligus mengumpulkan reward secara menyenangkan. Cukup ikuti empat langkah mudah ini.
              </p>
            </div>

            {/* Trail Stop vertical list */}
            <div className="relative border-l-2 border-dashed border-brand-line-strong ml-7 pl-10 space-y-12 py-2">
              {steps.map((step, idx) => (
                <div key={idx} className="relative text-left">
                  {/* Trail Stop Marker */}
                  <div className="absolute -left-[67px] top-0 w-[54px] h-[54px] rounded-full bg-brand-paper border-2 border-brand-forest flex items-center justify-center shrink-0">
                    {step.icon}
                    {/* Corner gold badge */}
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-gold flex items-center justify-center text-[10px] font-mono font-bold text-brand-text shadow-xs">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display text-lg font-semibold text-brand-text">{step.title}</h4>
                    <p className="font-body text-[14.5px] text-brand-text-soft leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Soft decorative background glows */}
            <div className="absolute inset-0 bg-brand-moss-light/20 rounded-[3rem] rotate-3 opacity-30 blur-2xl"></div>

            <div className="relative w-full max-w-[340px] group">
              {/* Main Image Container */}
              <div className="w-full aspect-[4/5] rounded-[32px] overflow-hidden shadow-md border border-brand-line relative">
                <img 
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop" 
                  alt="Ilustrasi Aktivitas Hijau"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                {/* Subtle Gradient for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
              </div>

              {/* Floating Outer Overlay (Layered Depth) */}
              <div className="absolute -bottom-5 -left-6 sm:-left-10 bg-brand-paper/95 backdrop-blur-md rounded-[20px] px-5 py-4 flex items-center gap-3 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] border border-white/20 z-10 transition-transform duration-500 group-hover:-translate-y-1">
                <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                  <span className="text-xl leading-none">🪙</span>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="font-display text-[15px] font-bold text-brand-text leading-none mb-1">
                    +50 Poin
                  </p>
                  <p className="font-body text-[10px] text-brand-forest font-semibold tracking-widest uppercase leading-none">
                    Terverifikasi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
