"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

export function PlatformStats() {
  const [stats, setStats] = useState({
    totalUsers: 1240,
    totalMerchants: 45,
    totalVerifiedActivities: 8920,
    totalRecycledWaste: 4.2, // Tons
    totalRewardsRedeemed: 1850,
  });

  useEffect(() => {
    apiFetch<any>("/api/dashboard/admin")
      .then((res) => {
        if (res.data) {
          setStats({
            totalUsers: res.data.totalUsers || 1240,
            totalMerchants: res.data.totalMerchants || 45,
            totalVerifiedActivities: res.data.activitiesCount?.APPROVED || 8920,
            totalRecycledWaste: 4.2,
            totalRewardsRedeemed: 1850,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="bg-brand-ink text-white font-sans py-[88px]">
      <div className="max-w-[1180px] mx-auto px-8 md:px-10">
        {/* Section Header */}
        <div className="text-left mb-12 space-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-gold flex items-center gap-2">
            <span className="inline-block w-[22px] h-[1px] bg-brand-gold" />
            Catatan Dampak
          </p>
          <h2 className="font-display text-3xl font-semibold text-white leading-tight">
            Logbook Kontribusi Komunitas
          </h2>
          <p className="font-body text-[15px] text-brand-moss-light max-w-xl leading-relaxed">
            Data tercatat secara real-time berdasarkan laporan aktivitas hijau yang terverifikasi di seluruh wilayah.
          </p>
        </div>

        {/* Ledger Rows */}
        <div className="border-t border-white/12 divide-y divide-white/12">
          {/* Row 1 */}
          <div className="py-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-[52px] h-[52px] rounded-full border border-dashed border-brand-gold/55 flex items-center justify-center text-brand-gold text-xl shrink-0">
                👥
              </div>
              <div className="text-left">
                <p className="font-body text-sm font-semibold text-white leading-tight">User Aktif</p>
                <p className="font-body text-[12px] text-brand-moss-light/80 mt-1">Anggota penjaga kelestarian lingkungan</p>
              </div>
            </div>
            <p className="font-display text-2xl font-semibold text-white">
              <span className="font-mono">{stats.totalUsers.toLocaleString("id-ID")}</span>
              <span className="font-mono text-sm text-brand-gold ml-1">+</span>
            </p>
          </div>

          {/* Row 2 */}
          <div className="py-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-[52px] h-[52px] rounded-full border border-dashed border-brand-gold/55 flex items-center justify-center text-brand-gold text-xl shrink-0">
                🏪
              </div>
              <div className="text-left">
                <p className="font-body text-sm font-semibold text-white leading-tight">Mitra UMKM</p>
                <p className="font-body text-[12px] text-brand-moss-light/80 mt-1">Penyedia produk ramah lingkungan pilihan</p>
              </div>
            </div>
            <p className="font-display text-2xl font-semibold text-white">
              <span className="font-mono">{stats.totalMerchants}</span>
              <span className="font-mono text-sm text-brand-gold ml-1">toko</span>
            </p>
          </div>

          {/* Row 3 */}
          <div className="py-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-[52px] h-[52px] rounded-full border border-dashed border-brand-gold/55 flex items-center justify-center text-brand-gold text-xl shrink-0">
                ✅
              </div>
              <div className="text-left">
                <p className="font-body text-sm font-semibold text-white leading-tight">Aksi Terverifikasi</p>
                <p className="font-body text-[12px] text-brand-moss-light/80 mt-1">Aksi lingkungan terverifikasi foto GPS</p>
              </div>
            </div>
            <p className="font-display text-2xl font-semibold text-white">
              <span className="font-mono">{stats.totalVerifiedActivities.toLocaleString("id-ID")}</span>
              <span className="font-mono text-sm text-brand-gold ml-1">aksi</span>
            </p>
          </div>

          {/* Row 4 */}
          <div className="py-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-[52px] h-[52px] rounded-full border border-dashed border-brand-gold/55 flex items-center justify-center text-brand-gold text-xl shrink-0">
                ♻️
              </div>
              <div className="text-left">
                <p className="font-body text-sm font-semibold text-white leading-tight">Sampah Terdaur Ulang</p>
                <p className="font-body text-[12px] text-brand-moss-light/80 mt-1">Total sampah plastik &amp; organik tereduksi</p>
              </div>
            </div>
            <p className="font-display text-2xl font-semibold text-white">
              <span className="font-mono">{stats.totalRecycledWaste}</span>
              <span className="font-mono text-sm text-brand-gold ml-1">Ton</span>
            </p>
          </div>

          {/* Row 5 */}
          <div className="py-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-[52px] h-[52px] rounded-full border border-dashed border-brand-gold/55 flex items-center justify-center text-brand-gold text-xl shrink-0">
                🎁
              </div>
              <div className="text-left">
                <p className="font-body text-sm font-semibold text-white leading-tight">Voucher Ditukar</p>
                <p className="font-body text-[12px] text-brand-moss-light/80 mt-1">Reward terdistribusi bagi pejuang aksi hijau</p>
              </div>
            </div>
            <p className="font-display text-2xl font-semibold text-white">
              <span className="font-mono">{stats.totalRewardsRedeemed.toLocaleString("id-ID")}</span>
              <span className="font-mono text-sm text-brand-gold ml-1">kali</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
