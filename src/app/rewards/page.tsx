"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useVouchers, useRedeemReward } from "@/features/reward/hooks/use-rewards";
import { ApiError } from "@/lib/api-client";
import type { Voucher } from "@/features/reward/types";

export default function RewardsPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useVouchers({ status: "AVAILABLE" });
  const redeemReward = useRedeemReward();

  const [page, setPage] = useState(1);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [redeemedTitle, setRedeemedTitle] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const vouchers = data?.vouchers || [];
  const meta = data?.meta;

  const handleRedeem = (voucher: Voucher) => {
    setErrorMsg(null);
    if (!user || user.totalPoint < voucher.pointCost) return;

    if (confirm(`Apakah Anda yakin ingin menukarkan ${voucher.pointCost} Poin untuk voucher "${voucher.title}"?`)) {
      redeemReward.mutate(voucher.id, {
        onSuccess: (res) => {
          setRedeemedCode(res.data.voucherCode);
          setRedeemedTitle(voucher.title);
        },
        onError: (err) => {
          setErrorMsg(err instanceof ApiError ? err.message : "Terjadi kesalahan saat menukarkan voucher.");
        },
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
            Penukaran Poin
          </h1>
          <p className="font-body text-sm text-ink-400 mt-1">
            Tukarkan akumulasi poin aksi lingkunganmu dengan voucher belanja menarik dari UMKM lokal.
          </p>
        </div>
        <Link
          href="/reward/history"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-white border border-paper-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-paper-50 transition shadow-xs self-start sm:self-auto"
        >
          Riwayat Penukaran
        </Link>
      </div>

      {/* Point Balance card */}
      <div className="rounded-lg bg-moss-900 px-6 py-6 text-paper-50 flex flex-col justify-between sm:flex-row sm:items-center gap-4 shadow-sm border border-moss-700">
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-wider opacity-85">Saldo Poin Anda</p>
          <p className="font-display text-4xl font-bold text-ochre-400">
            {user?.totalPoint ?? 0} <span className="text-xl font-normal text-paper-50">Poin</span>
          </p>
        </div>
        <p className="font-body text-sm opacity-80 max-w-sm">
          Terus kumpulkan poin dengan melaporkan aksi membuang sampah, mendaur ulang, dan merawat lingkungan di menu Aktivitasku!
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 px-4 py-3 text-sm text-rust-600 font-body">
          {errorMsg}
        </div>
      )}

      {isError && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-4 text-center text-sm text-rust-600 font-body">
          Gagal memuat daftar voucher. Silakan refresh halaman.
        </div>
      )}

      {isLoading ? (
        /* Skeletons */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-paper-200 bg-white overflow-hidden space-y-3">
              <div className="h-44 bg-paper-100" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-1/4 rounded bg-paper-100" />
                <div className="h-5 w-3/4 rounded bg-paper-100" />
                <div className="h-6 w-1/3 rounded bg-paper-100 pt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : vouchers.length === 0 ? (
        /* Empty State */
        <div className="rounded-lg border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400 max-w-lg mx-auto font-body">
          <svg className="mx-auto h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <h3 className="mt-3 text-base font-semibold text-ink-900">Voucher Tidak Tersedia</h3>
          <p className="mt-1 text-sm">Saat ini belum ada voucher aktif yang dapat ditukarkan.</p>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vouchers.map((voucher: Voucher) => {
            const hasEnoughPoints = (user?.totalPoint ?? 0) >= voucher.pointCost;
            const isOutOfStock = voucher.stock <= 0;

            return (
              <div
                key={voucher.id}
                className="flex flex-col overflow-hidden rounded-lg border border-paper-200 bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:border-moss-500 hover:shadow-md font-body"
              >
                {/* Image */}
                <div className="relative h-44 w-full bg-paper-50 flex items-center justify-center overflow-hidden border-b border-paper-100">
                  {voucher.imageUrl ? (
                    <img src={voucher.imageUrl} alt={voucher.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-ink-300">
                      <svg className="h-8 w-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      <span className="text-[10px] uppercase font-mono tracking-wider mt-1">Voucher</span>
                    </div>
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="rounded-xs bg-rust-600 px-2 py-1 font-mono text-[10px] font-bold text-white uppercase tracking-wider">
                        Habis
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-[9px] uppercase tracking-wider text-ink-400 font-semibold">
                        {voucher.category?.name || "Kategori"}
                      </p>
                      <span className="font-mono text-[10px] text-ink-400">
                        Stok: {voucher.stock}
                      </span>
                    </div>
                    <h3 className="line-clamp-2 text-sm font-semibold text-ink-900 leading-tight">
                      {voucher.title}
                    </h3>
                    <p className="line-clamp-2 text-xs text-ink-400 pt-1 leading-normal">
                      {voucher.description || "Tidak ada deskripsi."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-ink-400 font-semibold uppercase tracking-wider leading-none">Biaya</p>
                      <p className="font-display text-lg font-bold text-moss-700">
                        {voucher.pointCost} <span className="font-body text-xs font-normal text-ink-900">Pts</span>
                      </p>
                    </div>

                    <button
                      disabled={isOutOfStock || !hasEnoughPoints || redeemReward.isPending}
                      onClick={() => handleRedeem(voucher)}
                      className={`rounded-md px-4 py-2 text-xs font-semibold shadow-xs transition duration-200 ${
                        isOutOfStock
                          ? "bg-paper-100 text-ink-300 cursor-not-allowed"
                          : !hasEnoughPoints
                          ? "bg-paper-100 text-rust-500 cursor-not-allowed"
                          : "bg-moss-700 text-paper-50 hover:bg-moss-900"
                      }`}
                    >
                      {redeemReward.isPending ? "Proses..." : isOutOfStock ? "Habis" : !hasEnoughPoints ? "Poin Kurang" : "Tukarkan"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-paper-200 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex h-9 items-center justify-center rounded-md border border-paper-200 bg-white px-4 text-sm font-medium text-ink-700 hover:bg-paper-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Sebelumnya
          </button>
          <span className="font-mono text-xs text-ink-400">
            Halaman {meta.page} dari {meta.totalPages}
          </span>
          <button
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex h-9 items-center justify-center rounded-md border border-paper-200 bg-white px-4 text-sm font-medium text-ink-700 hover:bg-paper-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Selanjutnya →
          </button>
        </div>
      )}

      {/* Successful Redemption Modal */}
      {redeemedCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-lg border border-paper-200 bg-white p-6 shadow-xl font-body text-center space-y-5 animate-scale-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-moss-50 text-moss-700 border border-moss-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-ink-900">Penukaran Berhasil!</h3>
              <p className="text-xs text-ink-400">Voucher untuk &quot;{redeemedTitle}&quot; telah diklaim.</p>
            </div>

            {/* Voucher Code Box */}
            <div className="rounded-md border-2 border-dashed border-moss-500 bg-moss-50/20 py-4 font-mono text-xl font-bold tracking-widest text-moss-700 select-all">
              {redeemedCode}
            </div>

            <p className="text-[10px] text-ink-400 leading-normal">
              Salin kode di atas dan berikan kepada kasir mitra UMKM terkait untuk mengklaim reward Anda. Kode ini juga tersimpan di Riwayat Penukaran Anda.
            </p>

            <button
              onClick={() => {
                setRedeemedCode(null);
                setRedeemedTitle(null);
              }}
              className="w-full rounded-md bg-moss-700 py-2 text-xs font-semibold text-paper-50 hover:bg-moss-900 transition"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
