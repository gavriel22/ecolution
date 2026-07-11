"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useVouchers, useRedeemReward, useRedemptionHistory } from "@/features/reward/hooks/use-rewards";
import { ApiError } from "@/lib/api-client";
import type { Voucher } from "@/features/reward/types";
import { useConfirm } from "@/providers/confirm-provider";

export default function RewardsPage() {
  const confirmDialog = useConfirm();
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
  const accumulatedPoint = user?.accumulatedPoint ?? totalPoint;
  const level = Math.floor(accumulatedPoint / 1000) + 1;
  const currentLevelPoints = accumulatedPoint % 1000;
  const pointsToNextLevel = 1000 - currentLevelPoints;
  const progressPercent = Math.min(100, Math.round((currentLevelPoints / 1000) * 100));

  const handleRedeem = async (voucher: Voucher) => {
    setErrorMsg(null);
    if (user.totalPoint < voucher.pointCost) return;

    if (await confirmDialog(`Apakah Anda yakin ingin menukarkan ${voucher.pointCost} Poin untuk voucher "${voucher.title}"?`)) {
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
    <div className="bg-[#F8F9FA] min-h-screen pb-12">
      {/* Hero Section */}
      <div className="relative border-b border-brand-line pt-32 pb-16 overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/landing.jpg"
            alt="Rewards Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#e6eedd] via-[#e6eedd]/90 to-[#e6eedd]/50" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-4xl lg:max-w-5xl">
              <h1 className="font-display text-4xl sm:text-5xl font-black text-brand-text tracking-tight mb-3">
                Penukaran Reward
              </h1>
              <p className="font-body text-base text-brand-text-soft leading-relaxed lg:whitespace-nowrap">
                Tukarkan akumulasi poin aksi lingkunganmu dengan voucher menarik dari UMKM mitra Ecolution.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-30 font-body">

      {/* Point Balance & Level Summary Card */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-xl border border-paper-200 p-6 md:p-8 shadow-sm">
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
            <div className="bg-moss-700 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-xs text-ink-400">
            Kumpulkan <span className="font-bold text-moss-700">{pointsToNextLevel} poin</span> lagi untuk naik ke Level {level + 1}!
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-8 rounded-md border border-rust-500/30 bg-rust-500/5 px-4 py-3 text-sm text-rust-600">
          {errorMsg}
        </div>
      )}

      {/* Tab Switchers */}
      <div className="mb-8 flex border-b border-paper-200 gap-6 text-sm font-semibold">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {vouchers.map((voucher: Voucher) => {
                const hasEnoughPoints = totalPoint >= voucher.pointCost;
                const isOutOfStock = voucher.stock <= 0;

                return (
                  <div
                    key={voucher.id}
                    className="bg-white rounded-2xl border border-brand-line overflow-hidden flex flex-col md:flex-row shadow-xs hover:shadow-md transition duration-300 group"
                  >
                    {/* Left side: Ticket Details */}
                    <div className="flex-1 p-6 md:p-8 space-y-4 text-left">
                      <div className="space-y-1">
                        <p className="font-mono text-[10px] text-brand-gold-deep font-bold tracking-wider uppercase">
                          Admin Ecolution • Stok: {voucher.stock}
                        </p>
                        <h3 className="font-display text-lg font-bold text-brand-text leading-snug">
                          {voucher.title}
                        </h3>
                        <p className="font-body text-[13.5px] text-brand-text-soft leading-relaxed line-clamp-2">
                          {voucher.description || "Tidak ada deskripsi."}
                        </p>
                      </div>
                    </div>

                    {/* Perforation Line */}
                    <div className="hidden md:flex flex-col justify-between py-2 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#F8F9FA] -mt-3.5 -ml-1 border-b border-r border-brand-line"></div>
                      <div className="flex-1 border-r-2 border-dashed border-brand-line my-1"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#F8F9FA] -mb-3.5 -ml-1 border-t border-r border-brand-line"></div>
                    </div>

                    {/* Right side: Coupon Cost & Button */}
                    <div className="w-full md:w-[220px] bg-brand-paper-3/40 p-6 md:p-8 flex flex-col justify-between items-center text-center shrink-0 border-t md:border-t-0 border-brand-line">
                      <div className="space-y-1">
                        <p className="font-mono text-[9px] text-brand-text-soft font-bold uppercase tracking-widest">
                          Biaya Poin
                        </p>
                        <p className="font-display text-2xl font-semibold text-brand-forest flex items-center justify-center gap-1.5">
                           {voucher.pointCost}
                          <span className="font-sans text-xs font-normal text-brand-text-soft">Pts</span>
                        </p>
                        {voucher.discountAmount > 0 && (
                          <p className="text-[10px] text-amber-600 font-bold mt-1">
                            Diskon Rp {new Intl.NumberFormat("id-ID").format(voucher.discountAmount)}
                          </p>
                        )}
                      </div>

                      <button
                        disabled={isOutOfStock || !hasEnoughPoints || redeemReward.isPending}
                        onClick={() => handleRedeem(voucher)}
                        className={`w-full mt-4 py-2.5 rounded-md font-bold text-xs text-center transition-all duration-200 shadow-xs ${
                          isOutOfStock
                            ? "bg-paper-200 text-ink-400 cursor-not-allowed"
                            : !hasEnoughPoints
                            ? "bg-paper-200 text-rust-500 cursor-not-allowed"
                            : "bg-brand-forest text-white hover:bg-brand-forest-2"
                        }`}
                      >
                        {redeemReward.isPending ? "Proses..." : isOutOfStock ? "Habis" : !hasEnoughPoints ? "Poin Kurang" : "Tukarkan"}
                      </button>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {myRedemptions.map((red: any) => {
                const statusInfo = getStatusLabel(red.status);
                return (
                  <div
                    key={red.id}
                    className="bg-white rounded-2xl border border-brand-line overflow-hidden flex flex-col md:flex-row shadow-xs hover:shadow-md transition duration-300 group"
                  >
                    <div className="flex-1 p-6 md:p-8 space-y-4 text-left">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] text-brand-gold-deep font-bold font-mono tracking-wider uppercase">
                            <span>{red.voucher?.merchant?.businessName || "Mitra UMKM"}</span>
                            <span>·</span>
                            <span>{formatDate(red.redeemedAt)}</span>
                          </div>
                          <h3 className="font-display text-lg font-bold text-brand-text leading-snug">
                            {red.voucher?.title || "Voucher"}
                          </h3>
                          <p className="font-body text-[13.5px] text-brand-text-soft">
                             Biaya: {red.voucher?.pointCost || 0} Pts
                          </p>
                        </div>
                        <div>
                          <span className={`inline-block border text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${statusInfo.class}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Perforation Line */}
                    <div className="hidden md:flex flex-col justify-between py-2 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#F8F9FA] -mt-3.5 -ml-1 border-b border-r border-brand-line"></div>
                      <div className="flex-1 border-r-2 border-dashed border-brand-line my-1"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#F8F9FA] -mb-3.5 -ml-1 border-t border-r border-brand-line"></div>
                    </div>

                    {/* Right side: Status */}
                    <div className="w-full md:w-[220px] bg-brand-paper-3/40 p-6 md:p-8 flex flex-col justify-center items-center text-center shrink-0 border-t md:border-t-0 border-brand-line">
                      <p className="font-mono text-[9px] text-brand-text-soft font-bold uppercase tracking-widest mb-3">
                        Kode Voucher
                      </p>
                      <div className="flex flex-col items-center gap-3 w-full">
                        <span className="w-full truncate rounded-xl border border-brand-forest/20 bg-brand-forest/5 px-3 py-2 text-sm font-bold tracking-wider text-brand-forest select-all">
                          {red.voucherCode}
                        </span>
                        <button
                          onClick={() => handleCopy(red.id, red.voucherCode)}
                          className="w-full rounded-xl border border-brand-line bg-white py-2 text-xs font-bold text-brand-text-soft hover:bg-brand-paper-2 hover:text-brand-forest transition flex justify-center items-center gap-2 shadow-xs"
                          title="Salin Kode"
                        >
                          {copiedId === red.id ? (
                            <span className="text-[10px] text-brand-forest font-bold">Tersalin!</span>
                          ) : (
                            <>
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              Salin Kode
                            </>
                          )}
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
    </div>
  );
}
