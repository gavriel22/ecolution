"use client";

import { Camera, Gift, Trophy, Store } from "lucide-react";

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

            <div className="relative w-full max-w-[340px] bg-brand-paper-2 border border-brand-line rounded-[40px] shadow-sm p-6 aspect-[4/5] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-brand-line pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-paper-3 flex items-center justify-center">
                    <span className="text-base">🧑‍🌾</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-brand-text">Misi Daur Ulang</div>
                    <div className="text-[9px] text-brand-text-soft font-mono">GPS VERIFIED</div>
                  </div>
                </div>
                <div className="px-2.5 py-0.5 bg-brand-forest text-brand-paper text-[10px] font-bold rounded-full font-mono">
                  Lvl 3
                </div>
              </div>

              <div className="flex-1 bg-brand-paper rounded-2xl border border-brand-line p-6 flex flex-col justify-center items-center text-center my-4 space-y-4">
                <div className="w-16 h-16 bg-brand-paper-2 text-brand-forest rounded-full flex items-center justify-center shadow-xs">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-display font-semibold text-sm text-brand-text">Upload Foto Botol Plastik</h5>
                  <p className="text-xs text-brand-text-soft max-w-[200px] leading-relaxed">Ambil foto bukti aktivitas daur ulang botol plastik di tempat sampah khusus.</p>
                </div>
                <div className="w-full bg-brand-forest text-white py-2 rounded-lg text-xs font-semibold shadow-xs hover:bg-brand-forest-2 transition duration-300">
                  Ambil Foto Aksi
                </div>
              </div>

              <div className="bg-brand-paper-3/40 p-2.5 rounded-xl border border-brand-line text-center">
                <p className="text-[10.5px] text-brand-forest font-bold font-mono">🪙 +50 Poin terverifikasi instan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
