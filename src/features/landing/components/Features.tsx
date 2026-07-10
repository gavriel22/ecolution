"use client";

import { Camera, Gift, Trophy, Store } from "lucide-react";

export function Features() {
  const steps = [
    {
      title: "1. Ambil Foto Aktivitas",
      description: "Potret aktivitas daur ulang sampahmu langsung dari kamera HP dengan GPS aktif.",
      icon: <Camera className="w-6 h-6 text-moss-700" />,
      color: "bg-moss-50",
    },
    {
      title: "2. Verifikasi Otomatis",
      description: "Sistem kami memverifikasi waktu, lokasi GPS, dan keaslian foto dalam hitungan detik.",
      icon: <Store className="w-6 h-6 text-moss-700" />,
      color: "bg-moss-50",
    },
    {
      title: "3. Dapatkan Koin Poin",
      description: "Setelah disetujui, kamu langsung mendapatkan koin poin reward sesuai dengan dampak lingkungan aksimu.",
      icon: <Trophy className="w-6 h-6 text-moss-700" />,
      color: "bg-moss-50",
    },
    {
      title: "4. Tukarkan Voucher",
      description: "Tukarkan poinmu dengan voucher belanja digital gratis dari mitra UMKM lokal.",
      icon: <Gift className="w-6 h-6 text-moss-700" />,
      color: "bg-moss-50",
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-white overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <h2 className="text-xs font-bold tracking-widest text-moss-700 uppercase">
                Alur Kontribusi
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight leading-tight">
                Bagaimana Cara Kerja <span className="text-moss-700">Ecolution?</span>
              </h3>
              <p className="text-base sm:text-lg text-ink-400 leading-relaxed max-w-xl">
                Ecolution mempermudah kamu menjaga bumi sekaligus mengumpulkan reward secara menyenangkan. Cukup ikuti empat langkah mudah ini.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {steps.map((step, idx) => (
                <div 
                  key={idx} 
                  className="p-6 rounded-2xl bg-paper-50/50 border border-paper-100 hover:border-moss-200 hover:shadow-xs transition duration-300 space-y-4"
                >
                  <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center`}>
                    {step.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-ink-900">{step.title}</h4>
                    <p className="text-xs text-ink-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Soft decorative background glows */}
            <div className="absolute inset-0 bg-gradient-to-tr from-moss-300 to-[#fbbc04]/20 rounded-[3rem] rotate-3 opacity-20 blur-2xl"></div>
            
            <div className="relative w-full max-w-[340px] bg-paper-50 border border-paper-200 rounded-[40px] shadow-xl p-6 aspect-[4/5] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-paper-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-moss-100 flex items-center justify-center">
                    <span className="text-base">🧑‍🌾</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-ink-900">Misi Daur Ulang</div>
                    <div className="text-[9px] text-ink-400">Verifikasi Lokasi Aktif</div>
                  </div>
                </div>
                <div className="px-2.5 py-0.5 bg-moss-100 text-moss-700 text-[10px] font-bold rounded-full">
                  Level 3
                </div>
              </div>
              
              <div className="flex-1 bg-white rounded-2xl border border-paper-100 p-6 flex flex-col justify-center items-center text-center my-4 space-y-4">
                <div className="w-16 h-16 bg-moss-50 text-moss-700 rounded-full flex items-center justify-center shadow-xs">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-sm text-ink-900">Upload Foto Botol Plastik</h5>
                  <p className="text-xs text-ink-400 max-w-[200px]">Ambil foto bukti aktivitas daur ulang botol plastik di tempat sampah khusus.</p>
                </div>
                <div className="w-full bg-moss-700 text-white py-2 rounded-xl text-xs font-semibold shadow-xs hover:bg-moss-900 transition duration-300">
                  Ambil Foto Aksi
                </div>
              </div>

              <div className="bg-moss-50/50 p-2.5 rounded-xl border border-moss-100 text-center">
                <p className="text-[10px] text-moss-800 font-bold">🎉 +50 Poin akan langsung dikirim setelah verifikasi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
