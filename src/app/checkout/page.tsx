"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateOrder } from "@/features/marketplace/hooks/use-marketplace-mutations";
import { useRedemptionHistory } from "@/features/reward/hooks/use-rewards";
import { ApiError } from "@/lib/api-client";
import type { VoucherRedemption } from "@/features/reward/types";
import { useAuth } from "@/context/auth-context";

interface CartItem {
  id: string;
  name: string;
  price: number;
  imageThumbnail: string | null;
  quantity: number;
  stock: number;
  merchantName: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const createOrder = useCreateOrder();
  const { user, isLoading: isAuthLoading } = useAuth();
  const cartKey = user ? `ecolution_cart_${user.id}` : "ecolution_cart_guest";

  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState<VoucherRedemption | null>(null);
  const [showVoucherList, setShowVoucherList] = useState(false);

  // Fetch user's available (unused) voucher redemptions
  const { data: redemptionData } = useRedemptionHistory({ page: 1, limit: 100 });
  const availableRedemptions = (redemptionData?.redemptions || []).filter(
    (r: VoucherRedemption) => r.status === "COMPLETED" && !r.usedAt
  );

  // Read cart on mount
  useEffect(() => {
    if (!isAuthLoading) {
      const savedCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
      setCart(savedCart);
      setIsClient(true);

      // If cart is empty, redirect back to marketplace
      if (savedCart.length === 0) {
        router.push("/marketplace");
      }
    }
  }, [router, isAuthLoading, cartKey]);

  if (!isClient || cart.length === 0) return null;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = selectedRedemption?.voucher?.discountAmount ?? 0;
  const finalPrice = Math.max(0, totalPrice - discountAmount);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    // Merge address and user note into a single string for backend Order note
    const mergedNote = `Alamat: ${address.trim()}${note.trim() ? ` | Catatan: ${note.trim()}` : ""}`;

    createOrder.mutate(
      {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        note: mergedNote,
        voucherRedemptionId: selectedRedemption?.id || undefined,
      },
      {
        onSuccess: () => {
          // Clear cart
          localStorage.removeItem(cartKey);
          // Redirect to orders
          router.push("/orders");
        },
      }
    );
  };

  const errorMessage =
    createOrder.error instanceof ApiError
      ? createOrder.error.message
      : createOrder.error
      ? "Gagal memproses pesanan Anda. Coba lagi."
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
          Checkout Pesanan
        </h1>
        <p className="font-body text-sm text-ink-400 mt-1">
          Lengkapi detail alamat pengiriman untuk memproses pembelian produk.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 px-4 py-3 text-sm text-rust-600 font-body">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Shipping Form details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs space-y-5 font-body">
            <h2 className="font-display text-lg font-bold text-ink-900 border-b border-paper-200 pb-2">
              Informasi Pengiriman
            </h2>

            {/* Address */}
            <div className="space-y-1.5">
              <label htmlFor="address" className="text-xs font-medium uppercase tracking-wide text-ink-400">
                Alamat Pengiriman Lengkap
              </label>
              <textarea
                id="address"
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                placeholder="Tuliskan nama penerima, no. telp, jalan, kelurahan/kecamatan, dan kode pos"
              />
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label htmlFor="note" className="text-xs font-medium uppercase tracking-wide text-ink-400">
                Catatan Tambahan <span className="normal-case text-ink-400/70">(opsional)</span>
              </label>
              <input
                id="note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                placeholder="Contoh: Titip tetangga sebelah jika rumah kosong"
              />
            </div>
          </div>

          {/* Voucher Section */}
          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs space-y-4 font-body">
            <h2 className="font-display text-lg font-bold text-ink-900 border-b border-paper-200 pb-2">
              Gunakan Voucher Reward
            </h2>

            {availableRedemptions.length === 0 ? (
              <div className="rounded-md bg-paper-50 border border-paper-200 p-4 text-sm text-ink-400 text-center">
                <p>Anda tidak memiliki voucher yang bisa digunakan.</p>
                <Link href="/rewards" className="mt-1 inline-block text-moss-700 hover:text-moss-900 font-semibold text-xs">
                  Tukar Poin dengan Voucher →
                </Link>
              </div>
            ) : selectedRedemption ? (
              <div className="flex items-center justify-between rounded-md border border-moss-300 bg-moss-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎁</span>
                  <div>
                    <p className="text-sm font-bold text-moss-900">{selectedRedemption.voucher?.title}</p>
                    <p className="text-xs text-moss-700 font-mono">
                      Diskon: {formatPrice(selectedRedemption.voucher?.discountAmount ?? 0)}
                    </p>
                    <p className="text-xs text-ink-400 font-mono mt-0.5">Kode: {selectedRedemption.voucherCode}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRedemption(null)}
                  className="text-xs font-semibold text-rust-600 hover:text-rust-900"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setShowVoucherList(!showVoucherList)}
                  className="w-full flex items-center justify-between rounded-md border border-dashed border-paper-300 bg-paper-50 px-4 py-3 text-sm text-ink-700 hover:border-moss-400 hover:bg-moss-50/30 transition"
                >
                  <span className="font-semibold">Pilih voucher ({availableRedemptions.length} tersedia)</span>
                  <span className="text-ink-400">{showVoucherList ? "▲" : "▼"}</span>
                </button>
                {showVoucherList && (
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {availableRedemptions.map((red: VoucherRedemption) => (
                      <button
                        key={red.id}
                        type="button"
                        onClick={() => { setSelectedRedemption(red); setShowVoucherList(false); }}
                        className="w-full flex items-center justify-between rounded-md border border-paper-200 bg-white px-4 py-3 hover:border-moss-400 hover:bg-moss-50/30 transition text-left"
                      >
                        <div>
                          <p className="text-sm font-bold text-ink-900">{red.voucher?.title}</p>
                          <p className="text-xs text-moss-700 font-mono">Diskon {formatPrice(red.voucher?.discountAmount ?? 0)}</p>
                          <p className="text-xs text-ink-400 font-mono">Kode: {red.voucherCode}</p>
                        </div>
                        <span className="text-xs font-semibold text-moss-700">Pakai →</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs space-y-4 font-body">
            <h2 className="font-display text-lg font-bold text-ink-900 border-b border-paper-200 pb-2">
              Ringkasan Pesanan
            </h2>

            {/* Itemized list */}
            <div className="divide-y divide-paper-100 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-paper-200 bg-paper-50">
                      {item.imageThumbnail ? (
                        <img
                          src={item.imageThumbnail}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-ink-300">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink-900">{item.name}</p>
                      <p className="font-mono text-[10px] text-ink-400">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-ink-900 font-semibold shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 border-t border-paper-200 pt-3">
              <div className="flex justify-between items-center text-sm text-ink-600">
                <span>Subtotal</span>
                <span className="font-mono">{formatPrice(totalPrice)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-sm text-moss-700">
                  <span className="font-semibold">Diskon Voucher 🎁</span>
                  <span className="font-mono font-bold">- {formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm border-t border-paper-200 pt-2">
                <span className="font-bold text-ink-900">Total Pembayaran</span>
                <span className="font-display font-bold text-moss-700 text-lg">{formatPrice(finalPrice)}</span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={createOrder.isPending || !address.trim()}
              className="w-full rounded-md bg-moss-700 py-3 text-center text-sm font-semibold text-paper-50 hover:bg-moss-900 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {createOrder.isPending ? "Memproses..." : "Buat Pesanan"}
            </button>

            <div className="text-center">
              <Link href="/cart" className="text-xs font-semibold text-moss-700 hover:text-moss-900">
                ← Kembali ke Keranjang
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
