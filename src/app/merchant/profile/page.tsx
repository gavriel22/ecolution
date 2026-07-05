"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";

export default function MerchantProfilePage() {
  const [merchant, setMerchant] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch<any>("/api/merchant/my"),
      apiFetch<any>("/api/dashboard/merchant").catch(() => ({ data: null }))
    ])
      .then(([resMerchant, resMetrics]) => {
        setMerchant(resMerchant.data);
        setMetrics(resMetrics.data);
      })
      .catch((err) => {
        console.error("Failed to load merchant profile", err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (error) {
    return (
      <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-6 text-center text-sm text-rust-600 font-body">
        Gagal memuat profil toko. Silakan hubungi admin atau refresh halaman.
      </div>
    );
  }

  if (loading || !merchant) {
    return (
      <div className="space-y-6 font-body">
        <div className="animate-pulse space-y-3">
          <div className="h-24 w-24 bg-paper-100 rounded-full" />
          <div className="h-8 w-48 bg-paper-100 rounded" />
          <div className="h-4 w-72 bg-paper-100 rounded" />
        </div>
      </div>
    );
  }

  const sales = metrics?.salesSummary || { totalRevenue: 0, totalItemsSold: 0, totalOrders: 0 };
  const statusColors: Record<string, string> = {
    APPROVED: "bg-moss-100 border-moss-300 text-moss-700",
    PENDING: "bg-ochre-100 border-ochre-300 text-ochre-700",
    REJECTED: "bg-rust-100 border-rust-300 text-rust-700",
    SUSPENDED: "bg-rust-100 border-rust-350 text-rust-800",
  };

  const statusLabels: Record<string, string> = {
    APPROVED: "Terverifikasi (Aktif)",
    PENDING: "Menunggu Persetujuan Admin",
    REJECTED: "Ditolak",
    SUSPENDED: "Ditangguhkan",
  };

  return (
    <div className="space-y-8 font-body">
      {/* Header Profile Toko */}
      <div className="rounded-lg border border-paper-200 bg-white p-6 shadow-xs flex flex-col md:flex-row gap-6 items-center">
        <div className="h-24 w-24 shrink-0 rounded-full border border-paper-200 overflow-hidden bg-paper-50 flex items-center justify-center">
          {merchant.logoUrl ? (
            <img src={merchant.logoUrl} alt={merchant.businessName} className="h-full w-full object-cover" />
          ) : (
            <svg className="h-10 w-10 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )}
        </div>
        <div className="text-center md:text-left flex-1 space-y-2">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center">
            <h1 className="font-display text-2xl font-bold text-ink-900 leading-tight">
              {merchant.businessName}
            </h1>
            <span className={`inline-block border text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded ${statusColors[merchant.status] || "bg-paper-100 text-ink-500"}`}>
              {statusLabels[merchant.status] || merchant.status}
            </span>
          </div>
          <p className="text-sm text-ink-400 max-w-xl">{merchant.description || "Tidak ada deskripsi toko."}</p>
          <p className="text-xs text-ink-400 font-mono">Toko Terdaftar Sejak: {formatDate(merchant.createdAt)}</p>
        </div>
      </div>

      {/* Grid Penjualan & Performa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informasi Bisnis */}
        <div className="rounded-lg border border-paper-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-paper-100 pb-2">
            Informasi Bisnis & Kontak
          </h2>
          <div className="grid grid-cols-1 gap-3.5 text-sm text-ink-700">
            <div className="grid grid-cols-3">
              <span className="text-ink-400 font-medium">Email Bisnis</span>
              <span className="col-span-2 font-mono break-all">{merchant.email || "-"}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-ink-400 font-medium">Nomor Telepon</span>
              <span className="col-span-2 font-mono">{merchant.phone || "-"}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-ink-400 font-medium">Website</span>
              <span className="col-span-2 font-mono text-moss-700 hover:underline">
                {merchant.website ? (
                  <a href={merchant.website} target="_blank" rel="noopener noreferrer">{merchant.website}</a>
                ) : "-"}
              </span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-ink-400 font-medium">Alamat Toko</span>
              <span className="col-span-2 leading-relaxed">{merchant.address || "-"}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-ink-400 font-medium">Jam Operasional</span>
              <span className="col-span-2">08:00 - 17:00 WIB (Mocked)</span>
            </div>
          </div>
        </div>

        {/* Statistik Penjualan Toko */}
        <div className="rounded-lg border border-paper-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-paper-100 pb-2">
            Performa & Statistik Penjualan
          </h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-paper-50 rounded-md border border-paper-100">
              <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Total Penjualan</p>
              <p className="mt-2 font-display text-lg font-bold text-moss-700">{formatPrice(sales.totalRevenue)}</p>
            </div>
            <div className="p-4 bg-paper-50 rounded-md border border-paper-100">
              <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Unit Terjual</p>
              <p className="mt-2 font-display text-lg font-bold text-ink-900">{sales.totalItemsSold} Unit</p>
            </div>
            <div className="p-4 bg-paper-50 rounded-md border border-paper-100">
              <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Total Pesanan</p>
              <p className="mt-2 font-display text-lg font-bold text-ink-900">{sales.totalOrders} Invoice</p>
            </div>
            <div className="p-4 bg-paper-50 rounded-md border border-paper-100">
              <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Rating Toko</p>
              <p className="mt-2 font-display text-lg font-bold text-ochre-600">4.8 / 5.0 (Mocked)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
