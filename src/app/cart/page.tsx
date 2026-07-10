"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function CartPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const cartKey = user ? `ecolution_cart_${user.id}` : "ecolution_cart_guest";

  // Read cart from localStorage on mount or when user changes
  useEffect(() => {
    if (!isAuthLoading) {
      setCart(JSON.parse(localStorage.getItem(cartKey) || "[]"));
      setIsClient(true);
    }
  }, [isAuthLoading, cartKey]);

  if (!isClient) return null;

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem(cartKey, JSON.stringify(newCart));
  };

  const handleUpdateQty = (id: string, delta: number) => {
    const updated = cart.map((item) => {
      if (item.id === id) {
        const nextQty = Math.max(1, Math.min(item.stock, item.quantity + delta));
        return { ...item, quantity: nextQty };
      }
      return item;
    });
    saveCart(updated);
  };

  const handleRemove = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    saveCart(updated);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
          Keranjang Belanja
        </h1>
        <p className="font-body text-sm text-ink-400 mt-1">
          Periksa kembali item pesananmu sebelum melakukan pembayaran.
        </p>
      </div>

      {cart.length === 0 ? (
        /* Empty State */
        <div className="rounded-lg border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400 max-w-lg mx-auto">
          <svg className="mx-auto h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-3 text-base font-semibold text-ink-900">Keranjang Kosong</h3>
          <p className="mt-1 text-sm">Belum ada barang di dalam keranjang belanjamu.</p>
          <div className="mt-6">
            <Link href="/marketplace" className="inline-flex rounded-md bg-moss-700 px-4 py-2 text-sm font-semibold text-paper-50 hover:bg-moss-900 transition">
              Cari Produk Ramah Lingkungan
            </Link>
          </div>
        </div>
      ) : (
        /* Content List + Summary */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border border-paper-200 bg-white p-4 shadow-xs"
              >
                {/* Thumbnail */}
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-paper-100 bg-paper-50 flex items-center justify-center">
                  {item.imageThumbnail ? (
                    <img loading="lazy" decoding="async" src={item.imageThumbnail} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-6 w-6 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-ink-400">
                    {item.merchantName}
                  </p>
                  <h3 className="truncate text-sm font-semibold text-ink-900 leading-tight">
                    {item.name}
                  </h3>
                  <p className="font-display text-sm font-bold text-moss-700">
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* Qty Selector */}
                <div className="flex items-center border border-paper-200 rounded bg-paper-50 h-8 shrink-0">
                  <button
                    disabled={item.quantity <= 1}
                    onClick={() => handleUpdateQty(item.id, -1)}
                    className="w-8 text-center font-mono font-bold text-ink-700 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-mono text-xs font-semibold text-ink-900">
                    {item.quantity}
                  </span>
                  <button
                    disabled={item.quantity >= item.stock}
                    onClick={() => handleUpdateQty(item.id, 1)}
                    className="w-8 text-center font-mono font-bold text-ink-700 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="rounded p-2 text-ink-400 hover:bg-paper-50 hover:text-rust-600 transition shrink-0"
                  aria-label="Remove item"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs space-y-4 self-start">
            <h2 className="font-display text-lg font-bold text-ink-900 border-b border-paper-200 pb-2">
              Ringkasan Belanja
            </h2>

            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-400">Total Harga ({cart.reduce((sum, item) => sum + item.quantity, 0)} barang)</span>
              <span className="font-display font-bold text-moss-700 text-lg">{formatPrice(totalPrice)}</span>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full rounded-md bg-moss-700 py-3 text-center text-sm font-semibold text-paper-50 hover:bg-moss-900 transition shadow-sm"
            >
              Lanjut ke Checkout
            </button>
            <div className="text-center">
              <Link href="/marketplace" className="text-xs font-semibold text-moss-700 hover:text-moss-900">
                ← Lanjutkan Belanja
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
