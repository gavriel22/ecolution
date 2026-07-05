"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useVouchers, useRedeemReward, useRedemptionHistory } from "@/features/reward/hooks/use-rewards";
import { ApiError } from "@/lib/api-client";
import type { Voucher } from "@/features/reward/types";

export default function RewardsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data: vouchersData, isLoading: vouchersLoading, isError: vouchersError } = useVouchers({ status: "AVAILABLE" });
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useRedemptionHistory({ page: 1, limit: 100 });
  const redeemReward = useRedeemReward();

  const [activeTab, setActiveTab] = useState<"available" | "my-vouchers">("available");
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  const [redeemedTitle, setRedeemedTitle] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex h-[400px] items-center justify-center font-body text-sm text-ink-400">
        Memproses otorisasi...
      </div>
    );
  }

  const vouchers = vouchersData?.vouchers || [];
  const myRedemptions = historyData?.redemptions || [];

  // Point metrics calculation
  const totalPoint = user?.totalPoint ?? 0;
  const level = Math.floor(totalPoint / 1000) + 1;
  const currentLevelPoints = totalPoint % 1000;
  const pointsToNextLevel = 1000 - currentLevelPoints;
  const progressPercent = Math.min(100, Math.round((currentLevelPoints / 1000) * 100));

  const handleRedeem = (voucher: Voucher) => {
    setErrorMsg(null);
    if (user.totalPoint < voucher.pointCost) return;

    if (confirm(`Apakah Anda yakin ingin menukarkan ${voucher.pointCost} Poin untuk voucher "${voucher.title}"?`)) {
      redeemReward.mutate(voucher.id, {
        onSuccess: (res) => {
          setRedeemedCode(res.data.voucherCode);
          setRedeemedTitle(voucher.title);
          refetchHistory();
        },
        onError: (err) => {
          setErrorMsg(err instanceof ApiError ? err.message : "Terjadi kesalahan saat menukarkan voucher.");
        },
      });
    }
  };

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return { text: "Digunakan", class: "bg-paper-100 border-paper-300 text-ink-400" };
      case "REJECTED":
      case "CANCELLED":
        return { text: "Kedaluwarsa", class: "bg-rust-50 border-rust-200 text-rust-600" };
      default:
        return { text: "Aktif", class: "bg-moss-50 border-moss-200 text-moss-700 font-bold" };
    }
  };

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
          Penukaran Reward
        </h1>
        <p className="text-sm text-ink-400">
          Tukarkan akumulasi poin aksi lingkunganmu dengan voucher menarik dari UMKM mitra Ecolution.
        </p>
      </div>

      {/* Point Balance & Level Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-3xl border border-paper-200 p-6 md:p-8 shadow-xs">
        <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-paper-100 pb-6 md:pb-0 md:pr-8 flex flex-col justify-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Saldo Poin Anda</p>
          <p className="font-display text-4xl font-black text-moss-700 mt-1">
            {totalPoint.toLocaleString("id-ID")}{" "}
            <span className="text-xl font-semibold text-ink-900">Poin</span>
          </p>
        </div>

        <div className="md:col-span-2 md:pl-4 space-y-3 flex flex-col justify-center">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-ink-900">Level {level} Champion</span>
            <span className="text-xs text-ink-400 font-mono">
              {currentLevelPoints} / 1.000 Poin ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-paper-100 h-3 rounded-full overflow-hidden border border-paper-200">
            <div className="bg-moss-750 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-xs text-ink-400">
            Kumpulkan <span className="font-bold text-moss-700">{pointsToNextLevel} poin</span> lagi untuk naik ke Level {level + 1}!
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 px-4 py-3 text-sm text-rust-600">
          {errorMsg}
        </div>
      )}

      {/* Tab Switchers */}
      <div className="flex border-b border-paper-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("available")}
          className={`pb-2 border-b-2 transition ${
            activeTab === "available"
              ? "border-moss-700 text-moss-700 font-bold"
              : "border-transparent text-ink-400 hover:text-ink-900"
          }`}
        >
          Voucher yang Tersedia
        </button>
        <button
          onClick={() => setActiveTab("my-vouchers")}
          className={`pb-2 border-b-2 transition ${
            activeTab === "my-vouchers"
              ? "border-moss-700 text-moss-700 font-bold"
              : "border-transparent text-ink-400 hover:text-ink-900"
          }`}
        >
          Voucher Saya ({myRedemptions.length})
        </button>
      </div>

      {/* Available Tab */}
      {activeTab === "available" && (
        <>
          {vouchersError && (
            <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-4 text-center text-sm text-rust-600">
              Gagal memuat daftar voucher. Silakan refresh halaman.
            </div>
          )}

          {vouchersLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-paper-200 bg-white h-64" />
              ))}
            </div>
          ) : vouchers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400 max-w-lg mx-auto">
              <svg className="mx-auto h-12 w-12 opacity-35" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <h3 className="mt-3 text-base font-semibold text-ink-900">Voucher Tidak Tersedia</h3>
              <p className="mt-1 text-sm">Saat ini belum ada voucher aktif yang dapat ditukarkan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vouchers.map((voucher: Voucher) => {
                const hasEnoughPoints = totalPoint >= voucher.pointCost;
                const isOutOfStock = voucher.stock <= 0;

                return (
                  <div
                    key={voucher.id}
                    className="flex flex-col bg-white rounded-2xl border border-paper-200 overflow-hidden shadow-xs hover:shadow-md transition duration-300"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative h-44 w-full bg-paper-50 flex items-center justify-center overflow-hidden border-b border-paper-100">
                      {voucher.imageUrl ? (
                        <img src={voucher.imageUrl} alt={voucher.title} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-4xl">🎁</span>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="rounded bg-rust-600 px-3 py-1 font-mono text-[10px] font-bold text-white uppercase tracking-wider">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Voucher Details */}
                    <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-ink-400 font-mono">
                          <span>🏪 {voucher.merchant?.businessName || "Mitra UMKM"}</span>
                          <span>Stok: {voucher.stock}</span>
                        </div>
                        <h3 className="text-sm font-bold text-ink-900 mt-1.5 leading-snug line-clamp-2">{voucher.title}</h3>
                        <p className="text-xs text-ink-400 mt-1.5 line-clamp-2 leading-relaxed">{voucher.description || "Tidak ada deskripsi."}</p>
                      </div>

                      <div className="border-t border-paper-100 pt-3 flex justify-between items-center">
                        <div className="font-mono">
                          <p className="text-[9px] uppercase tracking-wider text-ink-400 font-bold">Biaya Poin</p>
                          <p className="text-lg font-black text-moss-700">{voucher.pointCost} Pts</p>
                        </div>
                        <button
                          disabled={isOutOfStock || !hasEnoughPoints || redeemReward.isPending}
                          onClick={() => handleRedeem(voucher)}
                          className={`rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition duration-200 ${
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
        </>
      )}

      {/* Redeemed Tab */}
      {activeTab === "my-vouchers" && (
        <>
          {historyLoading ? (
            <div className="space-y-4">
              <div className="animate-pulse rounded-2xl border border-paper-200 bg-white h-24" />
            </div>
          ) : myRedemptions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400 max-w-lg mx-auto">
              <svg className="mx-auto h-12 w-12 opacity-35" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
              <h3 className="mt-3 text-base font-semibold text-ink-900">Belum Ada Voucher</h3>
              <p className="mt-1 text-sm">Anda belum pernah menukarkan poin dengan voucher belanja.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myRedemptions.map((red: any) => {
                const statusInfo = getStatusLabel(red.status);
                return (
                  <div
                    key={red.id}
                    className="rounded-2xl border border-paper-200 bg-white p-5 shadow-xs flex flex-col md:flex-row gap-5 items-start md:items-center justify-between hover:border-moss-500 transition duration-300"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] text-ink-400 font-mono">
                        <span>🏪 {red.voucher?.merchant?.businessName || "Mitra UMKM"}</span>
                        <span>·</span>
                        <span>Ditukar: {formatDate(red.redeemedAt)}</span>
                      </div>
                      <h3 className="text-sm font-bold text-ink-900 leading-tight">{red.voucher?.title || "Voucher"}</h3>
                      <p className="text-xs text-moss-700 font-bold font-mono">Biaya: {red.voucher?.pointCost || 0} Pts</p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 border-paper-100 pt-3 md:pt-0 shrink-0">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="rounded-xl border border-moss-350 bg-moss-50/20 px-3 py-1.5 text-xs font-bold tracking-wider text-moss-700 select-all">
                          {red.voucherCode}
                        </span>
                        <button
                          onClick={() => handleCopy(red.id, red.voucherCode)}
                          className="rounded-xl border border-paper-200 bg-white p-2 text-ink-400 hover:bg-paper-50 hover:text-moss-700 transition"
                          title="Salin Kode"
                        >
                          {copiedId === red.id ? (
                            <span className="text-[10px] text-moss-700 font-bold">Tersalin!</span>
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          )}
                        </button>
                      </div>

                      <span className={`inline-block border text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusInfo.class}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Successful Redemption Modal */}
      {redeemedCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-lg border border-paper-200 bg-white p-6 shadow-xl text-center space-y-5 animate-scale-in">
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

            <p className="text-[10px] text-ink-450 leading-normal">
              Salin kode di atas dan berikan kepada kasir mitra UMKM terkait untuk mengklaim reward Anda. Kode ini juga tersimpan di tab &quot;Voucher Saya&quot;.
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
