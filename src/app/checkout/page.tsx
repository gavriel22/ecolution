"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateOrder } from "@/features/marketplace/hooks/use-marketplace-mutations";
import { ApiError } from "@/lib/api-client";

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

  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Read cart on mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("ecolution_cart") || "[]");
    setCart(savedCart);
    setIsClient(true);

    // If cart is empty, redirect back to marketplace
    if (savedCart.length === 0) {
      router.push("/marketplace");
    }
  }, [router]);

  if (!isClient || cart.length === 0) return null;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
      },
      {
        onSuccess: () => {
          // Clear cart
          localStorage.removeItem("ecolution_cart");
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
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 px-4 py-3 text-sm text-rust-600">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Shipping Form details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs space-y-5">
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
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="font-display text-lg font-bold text-ink-900 border-b border-paper-200 pb-2">
              Ringkasan Pesanan
            </h2>

            {/* Itemized list */}
            <div className="divide-y divide-paper-100 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink-900">{item.name}</p>
                    <p className="font-mono text-[10px] text-ink-400">
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="font-mono text-ink-900 font-semibold shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Price */}
            <div className="border-t border-paper-200 pt-3 flex justify-between items-center text-sm">
              <span className="font-semibold text-ink-900">Total Pembayaran</span>
              <span className="font-display font-bold text-moss-700 text-lg">
                {formatPrice(totalPrice)}
              </span>
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
