"use client";

import { useState } from "react";
import Link from "next/link";
import { useRedemptionHistory } from "@/features/reward/hooks/use-rewards";

export default function RewardHistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useRedemptionHistory({ page, limit: 10 });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const redemptions = data?.redemptions || [];
  const meta = data?.meta;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
            Riwayat Penukaran
          </h1>
          <p className="font-body text-sm text-ink-400 mt-1">
            Lihat daftar voucher yang telah Anda klaim beserta kodenya.
          </p>
        </div>
        <Link
          href="/rewards"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-white border border-paper-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-paper-50 transition shadow-xs self-start sm:self-auto"
        >
          ← Kembali ke Voucher
        </Link>
      </div>

      {isError && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-4 text-center text-sm text-rust-600 font-body">
          Gagal memuat riwayat penukaran. Silakan coba lagi.
        </div>
      )}

      {isLoading ? (
        /* Loading Skeletons */
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-paper-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-paper-100 pb-3">
                <div className="h-4 w-1/3 rounded bg-paper-100" />
                <div className="h-5 w-20 rounded bg-paper-100" />
              </div>
              <div className="h-5 w-1/2 rounded bg-paper-100" />
            </div>
          ))}
        </div>
      ) : redemptions.length === 0 ? (
        /* Empty State */
        <div className="rounded-lg border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400 max-w-lg mx-auto font-body">
          <svg className="mx-auto h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-3 text-base font-semibold text-ink-900">Belum Ada Voucher</h3>
          <p className="mt-1 text-sm">Anda belum pernah menukarkan poin dengan voucher belanja.</p>
          <div className="mt-6">
            <Link href="/rewards" className="inline-flex rounded-md bg-moss-700 px-4 py-2 text-sm font-semibold text-paper-50 hover:bg-moss-900 transition">
              Tukarkan Poin Sekarang
            </Link>
          </div>
        </div>
      ) : (
        /* List */
        <div className="space-y-4">
          {redemptions.map((red: any) => (
            <div
              key={red.id}
              className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs flex flex-col justify-between sm:flex-row sm:items-center gap-4 font-body"
            >
              {/* Info */}
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-ink-400 font-semibold">
                    {red.voucher?.merchant?.businessName || "Mitra UMKM"}
                  </p>
                  <span className="h-1 w-1 rounded-full bg-paper-300" />
                  <p className="text-[10px] text-ink-400 font-mono">
                    Ditukar: {formatDate(red.redeemedAt)}
                  </p>
                </div>
                <h3 className="text-sm font-semibold text-ink-900 leading-tight">
                  {red.voucher?.title || "Voucher Terhapus"}
                </h3>
                <p className="font-display text-xs font-bold text-moss-700">
                  Biaya: {red.voucher?.pointCost || 0} Pts
                </p>
              </div>

              {/* Voucher Code Copy Action box */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t border-paper-100 sm:border-t-0 pt-3 sm:pt-0">
                <span className="text-[9px] uppercase tracking-wider font-bold text-ink-400 font-mono sm:hidden">
                  Kode Voucher:
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-moss-300 bg-moss-50/20 px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-moss-700 select-all">
                    {red.voucherCode}
                  </span>
                  <button
                    onClick={() => handleCopy(red.id, red.voucherCode)}
                    className="rounded-md border border-paper-200 bg-white p-1.5 text-ink-400 hover:bg-paper-50 hover:text-moss-700 transition"
                    title="Copy code"
                  >
                    {copiedId === red.id ? (
                      <svg className="h-4 w-4 text-moss-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h6m-6 4h6m-6 4h6" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  );
}
