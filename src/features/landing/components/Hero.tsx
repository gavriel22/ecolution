import Link from "next/link";

export function Hero() {
  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden" style={{ backgroundImage: 'url("/landing.jpg")' }}>
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-24 px-4">
        {/* Headline */}
        <h1 className="text-center flex flex-col items-center drop-shadow-lg">
          <span className="font-[cursive] text-5xl md:text-7xl lg:text-[90px] text-[#fbbc04] font-medium leading-none z-10" style={{ transform: 'rotate(-2deg)' }}>
            Aksi Hijau,
          </span>
          <span className="font-sans text-4xl md:text-6xl lg:text-[75px] text-white font-black tracking-tight mt-2">
            Dapat Poin Reward!
          </span>
        </h1>

        {/* Dashboard Mockup in place of empty card */}
        <div className="mt-8 relative w-full">
          <div className="w-[300px] h-[330px] md:w-[350px] md:h-[370px] lg:w-[400px] lg:h-[420px] bg-white text-ink-900 rounded-[30px] md:rounded-[40px] overflow-hidden shadow-2xl relative z-20 mx-auto p-6 flex flex-col justify-between font-sans border border-gray-150">
            {/* Header Mockup */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl">🌱</span>
                <div className="text-left">
                  <h3 className="font-bold text-xs md:text-sm text-ink-900">Ecolution App</h3>
                  <p className="text-[9px] md:text-xs text-ink-400">Dashboard Kontribusi</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-moss-100 text-moss-700 text-[9px] md:text-xs font-bold rounded-full">Level 4</span>
            </div>

            {/* Stats Mockup */}
            <div className="grid grid-cols-2 gap-3 my-2 text-center">
              <div className="bg-moss-50/50 p-2 md:p-3 rounded-xl border border-moss-100">
                <p className="text-[9px] md:text-xs text-moss-700 font-semibold uppercase tracking-wider">Total Poin</p>
                <p className="text-sm md:text-lg font-bold text-moss-800 mt-0.5">2,450 Pts</p>
              </div>
              <div className="bg-ochre-50/20 p-2 md:p-3 rounded-xl border border-ochre-200">
                <p className="text-[9px] md:text-xs text-ochre-700 font-semibold uppercase tracking-wider">Trust Score</p>
                <p className="text-sm md:text-lg font-bold text-ochre-600 mt-0.5">98%</p>
              </div>
            </div>

            {/* Progress Mockup */}
            <div className="bg-paper-50 p-3 rounded-xl border border-paper-200 space-y-1.5 text-left">
              <div className="flex justify-between items-center text-[10px] md:text-xs">
                <span className="font-semibold text-ink-800">♻️ Daur Ulang Plastik</span>
                <span className="font-mono text-ink-500 font-bold">4 / 5 Botol</span>
              </div>
              <div className="w-full bg-paper-200 h-2 rounded-full overflow-hidden">
                <div className="bg-moss-700 h-full rounded-full" style={{ width: "80%" }}></div>
              </div>
              <p className="text-[9px] text-ink-400 text-right">+100 Poin reward jika selesai</p>
            </div>

            {/* Button Mockup */}
            <Link href="/activity/new" className="bg-moss-700 text-white text-center py-2 rounded-xl font-bold text-[10px] md:text-xs shadow-md hover:bg-moss-900 transition-colors block">
              + Lapor Aksi Hijau Baru
            </Link>
          </div>
        </div>

        {/* Subheadline and CTA buttons */}
        <div className="w-full max-w-3xl mx-auto text-center mt-10 space-y-6 text-white drop-shadow-md pb-12">
          <p className="text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
            Kelola sampah dengan gamifikasi interaktif. Kumpulkan poin dari setiap aksi ramah lingkunganmu, selesaikan challenge mingguan, dan tukarkan dengan voucher menarik untuk mendukung produk lokal UMKM!
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/register" className="px-6 py-3 bg-[#fbbc04] hover:bg-[#e3aa04] text-gray-900 rounded-full font-bold transition-all shadow-lg hover:scale-105 text-sm md:text-base">
              Mulai Berkontribusi
            </Link>
            <Link href="/activity/new" className="px-6 py-3 bg-white hover:bg-gray-100 text-moss-900 rounded-full font-bold transition-all shadow-lg hover:scale-105 text-sm md:text-base">
              Upload Aktivitas
            </Link>
            <Link href="/marketplace" className="px-6 py-3 bg-transparent border border-white hover:bg-white/10 text-white rounded-full font-bold transition-all hover:scale-105 text-sm md:text-base">
              Jelajahi Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
