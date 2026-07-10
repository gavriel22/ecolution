"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { ProductCard } from "@/features/marketplace/components/product-card";
import { Footer } from "@/features/landing/components/Footer";

export default function MerchantStorePage({ params }: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = use(params);
  
  const [merchant, setMerchant] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    
    // Fetch merchant details and their products
    Promise.all([
      apiFetch<any>(`/api/merchant/${merchantId}`),
      apiFetch<any>(`/api/product?merchantId=${merchantId}&limit=50`),
    ])
      .then(([merchantRes, productsRes]) => {
        setMerchant(merchantRes.data);
        setProducts(productsRes.data || []);
      })
      .catch((err) => {
        console.error("Failed to load store data", err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [merchantId]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbfbf9] text-ink-900 font-sans">
        <main className="flex-1 pt-28 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
            <h2 className="text-xl font-bold text-ink-900">Toko Tidak Ditemukan</h2>
            <p className="text-ink-400 mt-2">Gagal memuat profil toko Mitra UMKM.</p>
            <Link href="/marketplace" className="mt-6 inline-flex rounded-md bg-moss-700 px-4 py-2 text-sm font-semibold text-paper-50 hover:bg-moss-900 transition">
              Kembali ke Marketplace
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading || !merchant) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbfbf9] text-ink-900 font-sans">
        <main className="flex-1 pt-28 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="h-[200px] rounded-lg bg-paper-100 animate-pulse" />
            <div className="flex gap-4 items-center">
              <div className="h-20 w-20 rounded-full bg-paper-100 animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-paper-100 animate-pulse" />
                <div className="h-4 w-32 bg-paper-100 animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-lg bg-paper-100 animate-pulse" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbf9] text-ink-900 font-sans">
      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 font-body">
          {/* Shop Banner Header */}
          <div
            className="relative h-48 md:h-64 rounded-lg overflow-hidden bg-cover bg-center shadow-inner"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1920&auto=format&fit=crop")',
            }}
          >
            <div className="absolute inset-0 bg-black/35" />
          </div>

          {/* Shop Info Card */}
          <div className="relative -mt-16 md:-mt-24 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-end gap-4 md:gap-6">
            {/* Logo */}
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border-4 border-white bg-white shadow-md flex items-center justify-center shrink-0">
              {merchant.logoUrl ? (
                <img loading="lazy" decoding="async" src={merchant.logoUrl} alt={merchant.businessName} className="h-full w-full object-cover" />
              ) : (
                <div className="text-moss-900 font-display font-semibold text-4xl uppercase select-none">
                  {merchant.businessName.charAt(0)}
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="flex-1 pb-2 space-y-2">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-ink-900 drop-shadow-sm leading-tight">
                  {merchant.businessName}
                </h1>
                <p className="text-xs text-ink-450 mt-1 font-mono">
                  {merchant.address || "Alamat belum ditambahkan"}
                </p>
              </div>
              <p className="text-sm text-ink-700 leading-relaxed max-w-2xl">
                {merchant.description || "Selamat datang di toko resmi kami yang menyediakan berbagai macam produk ramah lingkungan."}
              </p>
            </div>
          </div>

          {/* Shop Details grid stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-paper-200">
            {/* Contact Details */}
            <div className="md:col-span-1 space-y-3 bg-white p-5 rounded-lg border border-paper-200 text-xs text-ink-700 self-start">
              <h3 className="font-display text-sm font-bold text-ink-900 border-b border-paper-150 pb-1.5 font-semibold">Informasi Toko</h3>
              <p><span className="text-ink-400">Nomor Telepon:</span> {merchant.phone || "-"}</p>
              <p><span className="text-ink-400">Email:</span> {merchant.email || "-"}</p>
              {merchant.website && (
                <p>
                  <span className="text-ink-400">Website:</span>{" "}
                  <a href={merchant.website} target="_blank" rel="noopener noreferrer" className="text-moss-700 hover:underline break-all">
                    {merchant.website}
                  </a>
                </p>
              )}
              <p><span className="text-ink-400">Jumlah Produk:</span> {products.length} Barang</p>
            </div>

            {/* Products grid */}
            <div className="md:col-span-2 space-y-4">
              <h2 className="font-display text-xl font-bold text-ink-900">Semua Produk</h2>
              {products.length === 0 ? (
                <div className="rounded-lg border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400">
                  <p className="text-sm font-medium">Toko ini belum menambahkan produk ke marketplace.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={{ ...product, merchant }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
