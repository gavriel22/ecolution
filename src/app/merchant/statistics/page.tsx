"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";

export default function MerchantStatisticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch<any>("/api/dashboard/merchant")
      .then((res) => {
        setMetrics(res.data);
      })
      .catch((err) => {
        console.error("Failed to load statistics", err);
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

  if (error) {
    return (
      <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-6 text-center text-sm text-rust-600 font-body">
        Gagal memuat statistik penjualan. Silakan refresh halaman.
      </div>
    );
  }

  if (loading || !metrics) {
    return (
      <div className="space-y-6 font-body">
        <div className="animate-pulse space-y-2">
          <div className="h-8 w-48 bg-paper-100 rounded" />
          <div className="h-4 w-72 bg-paper-100 rounded" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded bg-paper-100 border border-paper-200" />
          ))}
        </div>
        <div className="h-64 rounded bg-paper-100 border border-paper-200 animate-pulse" />
      </div>
    );
  }

  const sales = metrics.salesSummary || { totalRevenue: 0, totalItemsSold: 0, totalOrders: 0 };
  const topSelling = metrics.topSellingProducts || [];

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
          Statistik Penjualan Toko
        </h1>
        <p className="text-sm text-ink-400 mt-1">
          Analisis performa finansial, volume penjualan produk, dan produk terlaris toko Anda.
        </p>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-moss-200 bg-moss-900 text-paper-50 p-5 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-wider opacity-85">Total Pendapatan</p>
          <p className="mt-2 font-display text-3xl font-bold text-ochre-400">{formatPrice(sales.totalRevenue)}</p>
          <p className="mt-1 text-[10px] opacity-75">Akumulasi pendapatan kotor toko</p>
        </div>

        <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Total Barang Terjual</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink-900">{sales.totalItemsSold} Unit</p>
          <p className="mt-1 text-[10px] text-ink-400">Akumulasi kuantitas produk yang sukses terjual</p>
        </div>

        <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Total Transaksi</p>
          <p className="mt-2 font-display text-3xl font-bold text-ink-900">{sales.totalOrders} Pesanan</p>
          <p className="mt-1 text-[10px] text-ink-400">Jumlah invoice lunas terkumpul</p>
        </div>
      </div>

      {/* Detailed Analysis of Top Selling Products */}
      <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h3 className="font-display text-lg font-bold text-ink-900">
            Daftar Produk Terlaris
          </h3>
          <p className="text-xs text-ink-400 mt-0.5">
            Pemeringkatan produk ramah lingkungan Anda berdasarkan total omzet penjualan.
          </p>
        </div>

        {topSelling.length === 0 ? (
          <div className="py-12 text-center text-ink-450 text-sm border-t border-paper-100">
            Belum ada transaksi penjualan yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-paper-100">
            <table className="w-full text-left border-collapse mt-2">
              <thead>
                <tr className="border-b border-paper-100 text-[10px] font-mono uppercase tracking-wider text-ink-400 font-semibold">
                  <th className="py-3 px-4">Peringkat</th>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4 text-center">Jumlah Terjual</th>
                  <th className="py-3 px-4 text-right">Total Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-100 text-sm text-ink-700">
                {topSelling.map((prod: any, index: number) => (
                  <tr key={prod.name} className="hover:bg-paper-50/20">
                    <td className="py-3 px-4 font-mono font-bold text-moss-700">#{index + 1}</td>
                    <td className="py-3 px-4 font-semibold text-ink-900">{prod.name}</td>
                    <td className="py-3 px-4 text-center font-mono">{prod.quantity} pcs</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-moss-750">
                      {formatPrice(prod.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
