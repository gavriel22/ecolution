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

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredProducts = products.filter((p) => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-paper-50 text-ink-900 font-body">
        <main className="flex-1 pt-28 pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center py-20">
            <div className="mx-auto h-16 w-16 bg-rust-100 rounded-full flex items-center justify-center text-rust-600 mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-ink-900">Toko Tidak Ditemukan</h2>
            <p className="text-ink-500 mt-2">Gagal memuat profil toko Mitra UMKM atau toko telah dihapus.</p>
            <Link href="/marketplace" className="mt-8 inline-flex items-center gap-2 rounded-md bg-moss-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-moss-900 transition shadow-sm">
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
      <div className="min-h-screen flex flex-col bg-paper-50 text-ink-900 font-body">
        <main className="flex-1 pt-28 pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="h-[200px] md:h-[300px] rounded-2xl bg-paper-200 animate-pulse" />
            <div className="bg-white rounded-2xl p-6 -mt-16 relative z-10 shadow-sm border border-paper-100 flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-paper-200 animate-pulse shrink-0 border-4 border-white" />
              <div className="space-y-3 w-full max-w-md text-center md:text-left mt-2">
                <div className="h-8 w-3/4 bg-paper-200 animate-pulse mx-auto md:mx-0 rounded" />
                <div className="h-4 w-1/2 bg-paper-200 animate-pulse mx-auto md:mx-0 rounded" />
                <div className="h-4 w-full bg-paper-200 animate-pulse rounded mt-4" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl bg-paper-200 animate-pulse" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper-50 text-ink-900 font-body">
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center text-sm text-ink-500 font-medium">
            <Link href="/marketplace" className="hover:text-moss-700 transition">Marketplace</Link>
            <svg className="w-4 h-4 mx-2 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-ink-900">{merchant.businessName}</span>
          </nav>

          {/* Header Card Section */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-paper-200">
            {/* Shop Banner */}
            <div
              className="relative h-48 md:h-64 bg-cover bg-center"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1920&auto=format&fit=crop")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Shop Identity Container */}
            <div className="relative px-6 pb-8 md:px-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
              {/* Logo */}
              <div className="-mt-16 h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border-4 border-white bg-white shadow-md flex items-center justify-center shrink-0 z-10">
                {merchant.logoUrl ? (
                  <img loading="lazy" decoding="async" src={merchant.logoUrl} alt={merchant.businessName} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-moss-800 font-display font-bold text-5xl uppercase select-none">
                    {merchant.businessName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="flex-1 text-center md:text-left mt-2 md:mt-4 space-y-3 w-full">
                <div>
                  <h1 className="font-display text-2xl md:text-4xl font-bold text-ink-900 leading-tight">
                    {merchant.businessName}
                  </h1>
                  <p className="text-sm text-ink-500 mt-1 flex items-center justify-center md:justify-start gap-1.5">
                    <svg className="w-4 h-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {merchant.address || "Lokasi tidak tersedia"}
                  </p>
                </div>
                <p className="text-sm text-ink-700 leading-relaxed max-w-2xl mx-auto md:mx-0">
                  {merchant.description || "Selamat datang di toko resmi kami. Menyediakan berbagai macam produk ramah lingkungan."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar: Store Information */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-paper-200">
                <h3 className="font-display text-lg font-bold text-ink-900 border-b border-paper-100 pb-3 mb-4">
                  Informasi Toko
                </h3>
                <div className="space-y-4 text-sm">
                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-paper-50 rounded-lg text-ink-500 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-ink-400 font-semibold uppercase tracking-wider mb-0.5">Telepon</p>
                      <p className="text-ink-900 font-medium">{merchant.phone || "-"}</p>
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-paper-50 rounded-lg text-ink-500 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-ink-400 font-semibold uppercase tracking-wider mb-0.5">Email</p>
                      <p className="text-ink-900 font-medium truncate">{merchant.email || "-"}</p>
                    </div>
                  </div>

                  {/* Website */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-paper-50 rounded-lg text-ink-500 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-ink-400 font-semibold uppercase tracking-wider mb-0.5">Website</p>
                      {merchant.website ? (
                        <a href={merchant.website} target="_blank" rel="noopener noreferrer" className="text-moss-700 font-medium hover:underline truncate block">
                          {merchant.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <p className="text-ink-900 font-medium">-</p>
                      )}
                    </div>
                  </div>

                  {/* Operasional */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-paper-50 rounded-lg text-ink-500 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-ink-400 font-semibold uppercase tracking-wider mb-0.5">Jam Operasional</p>
                      <p className="text-ink-900 font-medium">{merchant.operasionalHours || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-paper-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-500">Total Produk</span>
                  <span className="inline-flex items-center justify-center bg-moss-100 text-moss-800 text-xs font-bold px-2.5 py-1 rounded-full">
                    {products.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content: Products */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Search */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-paper-200">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Cari produk di toko ini..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-paper-50 border border-paper-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-moss-500/20 focus:border-moss-500 transition"
                  />
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-paper-200 bg-white p-16 text-center">
                  <div className="mx-auto h-16 w-16 bg-paper-50 rounded-full flex items-center justify-center text-ink-300 mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink-900">Produk Tidak Ditemukan</h3>
                  <p className="text-sm text-ink-500 mt-2">
                    {searchQuery ? "Coba gunakan kata kunci pencarian yang lain." : "Toko ini belum menambahkan produk."}
                  </p>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="mt-4 text-moss-700 text-sm font-semibold hover:underline">
                      Hapus Pencarian
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
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
