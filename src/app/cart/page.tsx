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

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-16">
      
      {/* Header Section */}
      <div className="bg-white border-b border-brand-line py-8 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl sm:text-4xl font-black text-brand-text tracking-tight">
            Keranjang Belanja
          </h1>
          <p className="font-body text-sm sm:text-base text-brand-text-soft mt-2">
            Periksa kembali pesanan Anda sebelum melanjutkan ke pembayaran.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {cart.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-brand-line bg-white p-16 text-center max-w-2xl mx-auto shadow-sm">
            <div className="mx-auto w-24 h-24 bg-brand-paper rounded-full flex items-center justify-center mb-6">
              <svg className="h-12 w-12 text-brand-text-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-brand-text mb-3">Keranjang Anda Kosong</h3>
            <p className="text-brand-text-soft mb-8 text-lg">Belum ada produk ramah lingkungan di dalam keranjang Anda.</p>
            <Link href="/marketplace" className="inline-flex rounded-xl bg-brand-forest px-8 py-4 text-base font-bold text-white hover:bg-brand-forest-2 hover:shadow-lg transition-all duration-300">
              Mulai Belanja Sekarang
            </Link>
          </div>
        ) : (
          /* Content Grid */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            
            {/* Items List */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-brand-line shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-brand-line flex items-center gap-4">
                <div className="px-4 py-1.5 rounded-full border border-brand-forest text-brand-forest font-bold text-sm bg-brand-paper">
                  Produk ({totalItems})
                </div>
              </div>
              
              <div className="divide-y divide-brand-line">
                {cart.map((item) => (
                  <div key={item.id} className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 hover:bg-gray-50/50 transition-colors">
                    
                    {/* Image */}
                    <div className="h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-2xl border border-brand-line bg-[#F8F9FA] flex items-center justify-center">
                      {item.imageThumbnail ? (
                        <img loading="lazy" decoding="async" src={item.imageThumbnail} alt={item.name} className="h-full w-full object-cover mix-blend-multiply" />
                      ) : (
                        <svg className="h-8 w-8 text-brand-text-soft opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="font-mono text-xs uppercase tracking-widest text-brand-text-soft font-semibold mb-1.5">
                            {item.merchantName}
                          </p>
                          <Link href={`/marketplace/${item.id}`} className="text-lg font-bold text-brand-text hover:text-brand-forest transition-colors leading-snug line-clamp-2">
                            {item.name}
                          </Link>
                        </div>
                        <p className="font-display text-xl font-bold text-brand-forest whitespace-nowrap">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Qty Selector */}
                        <div className="flex items-center border border-brand-line rounded-xl bg-white overflow-hidden h-10 w-32">
                          <button
                            disabled={item.quantity <= 1}
                            onClick={() => handleUpdateQty(item.id, -1)}
                            className="flex-1 h-full font-medium text-brand-text hover:bg-[#F8F9FA] disabled:opacity-30 transition-colors"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center font-bold text-brand-text text-sm">
                            {item.quantity}
                          </span>
                          <button
                            disabled={item.quantity >= item.stock}
                            onClick={() => handleUpdateQty(item.id, 1)}
                            className="flex-1 h-full font-medium text-brand-text hover:bg-[#F8F9FA] disabled:opacity-30 transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 text-sm font-semibold">
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-brand-text-soft hover:text-red-500 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="rounded-3xl border border-brand-line bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="font-display text-2xl font-black text-brand-text mb-6">
                  Ringkasan Belanja
                </h2>

                <div className="space-y-4 mb-6 text-brand-text">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-brand-text-soft">Total Barang ({totalItems})</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-brand-text-soft">Diskon</span>
                    <span className="text-brand-moss">- Rp 0</span>
                  </div>
                  
                  <div className="h-px w-full bg-brand-line my-4" />
                  
                  <div className="flex justify-between items-end">
                    <span className="text-base font-bold text-brand-text">Total Harga</span>
                    <span className="font-display text-2xl font-bold text-brand-forest">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full rounded-xl bg-brand-forest py-4 text-center text-base font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-brand-forest-2 transition-all duration-300 mb-4"
                >
                  Lanjut ke Pembayaran
                </button>
                
                <div className="text-center">
                  <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-bold text-brand-text-soft hover:text-brand-forest transition-colors">
                    ← Kembali Belanja
                  </Link>
                </div>
                
                <div className="mt-8 p-4 bg-brand-paper/50 rounded-xl border border-brand-line/50 flex gap-3 text-xs text-brand-text-soft">
                  <svg className="h-5 w-5 text-brand-forest shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Pembayaran aman dan terenkripsi. Produk akan dikirim langsung oleh UMKM mitra.</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
