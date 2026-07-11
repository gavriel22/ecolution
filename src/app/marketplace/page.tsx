"use client";

import { useState } from "react";
import Link from "next/link";
import { useProducts } from "@/features/marketplace/hooks/use-products";
import { ProductCard } from "@/features/marketplace/components/product-card";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // Fetch products using custom hook
  const { data, isLoading, isError } = useProducts({
    page,
    limit: 12,
    search: search || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    sortBy,
    sortOrder,
    status: "AVAILABLE",
  });

  const products = data?.products || [];
  const meta = data?.meta;

  const handleSortChange = (value: string) => {
    if (value === "latest") {
      setSortBy("createdAt");
      setSortOrder("desc");
    } else if (value === "price_asc") {
      setSortBy("price");
      setSortOrder("asc");
    } else if (value === "price_desc") {
      setSortBy("price");
      setSortOrder("desc");
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-brand-line py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl sm:text-5xl font-black text-brand-text tracking-tight mb-3">
                Marketplace UMKM
              </h1>
              <p className="font-body text-base text-brand-text-soft leading-relaxed">
                Gunakan poin hasil daur ulang dan aksi lingkunganmu untuk membeli produk ramah lingkungan dari mitra lokal pilihan.
              </p>
            </div>
            <div className="flex shrink-0">
              <Link
                href="/cart"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-forest px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand-forest-2 hover:shadow-lg hover:-translate-y-0.5"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Keranjang Belanja
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-white rounded-2xl border border-brand-line p-5 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-line">
                <h2 className="font-display font-bold text-brand-text text-lg">Filter</h2>
                <button 
                  onClick={clearFilters}
                  className="text-xs font-semibold text-brand-moss hover:text-brand-forest transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-brand-text-soft">Pencarian</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari produk..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="w-full rounded-xl border border-brand-line bg-[#F8F9FA] pl-10 pr-4 py-2.5 text-sm text-brand-text outline-none focus:border-brand-moss focus:ring-2 focus:ring-brand-moss/20 transition-all"
                    />
                    <svg className="absolute left-3 top-3 h-4 w-4 text-brand-text-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-brand-text-soft">Harga (Rp)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice || ""}
                      onChange={(e) => {
                        setMinPrice(e.target.value ? Number(e.target.value) : undefined);
                        setPage(1);
                      }}
                      className="w-full rounded-xl border border-brand-line bg-[#F8F9FA] px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-moss focus:ring-2 focus:ring-brand-moss/20 transition-all"
                    />
                    <span className="text-brand-text-soft">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice || ""}
                      onChange={(e) => {
                        setMaxPrice(e.target.value ? Number(e.target.value) : undefined);
                        setPage(1);
                      }}
                      className="w-full rounded-xl border border-brand-line bg-[#F8F9FA] px-3 py-2 text-sm text-brand-text outline-none focus:border-brand-moss focus:ring-2 focus:ring-brand-moss/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Grid */}
          <main className="flex-1">
            {/* Top Bar for Sort and Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-sm text-brand-text-soft">
                {isLoading ? "Memuat produk..." : (
                  <>Menampilkan <span className="font-bold text-brand-text">{meta?.totalCount || 0}</span> produk</>
                )}
              </p>
              
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm text-brand-text-soft">Urutkan:</span>
                <select
                  value={sortBy === "createdAt" ? "latest" : (sortOrder === "asc" ? "price_asc" : "price_desc")}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="rounded-lg border-none bg-white py-1.5 pl-3 pr-8 text-sm font-semibold text-brand-text shadow-sm outline-none focus:ring-2 focus:ring-brand-moss/20 cursor-pointer"
                >
                  <option value="latest">Terbaru</option>
                  <option value="price_asc">Harga Terendah</option>
                  <option value="price_desc">Harga Tertinggi</option>
                </select>
              </div>
            </div>

            {isError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600 mb-8">
                Gagal memuat produk. Silakan refresh halaman.
              </div>
            )}

            {isLoading ? (
              /* Loading Skeleton */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-white border border-brand-line overflow-hidden">
                    <div className="aspect-[4/3] bg-brand-line/50" />
                    <div className="p-5 space-y-4">
                      <div className="h-3 w-1/3 rounded bg-brand-line/50" />
                      <div className="h-5 w-3/4 rounded bg-brand-line/50" />
                      <div className="flex items-center justify-between pt-2">
                        <div className="h-6 w-2/5 rounded bg-brand-line/50" />
                        <div className="h-8 w-8 rounded-full bg-brand-line/50" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <div className="rounded-2xl border border-dashed border-brand-line bg-white p-16 text-center shadow-sm">
                <div className="mx-auto w-20 h-20 bg-[#F8F9FA] rounded-full flex items-center justify-center mb-4">
                  <svg className="h-10 w-10 text-brand-text-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-brand-text mb-2">Produk Tidak Ditemukan</h3>
                <p className="text-brand-text-soft max-w-sm mx-auto mb-6">Maaf, kami tidak dapat menemukan produk yang sesuai dengan filter dan pencarian Anda.</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-white border border-brand-line text-brand-text font-semibold rounded-xl hover:bg-[#F8F9FA] transition-colors"
                >
                  Hapus Filter
                </button>
              </div>
            ) : (
              /* Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center mt-12 gap-4">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-line bg-white text-brand-text hover:bg-[#F8F9FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: meta.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                        page === i + 1 
                          ? "bg-brand-forest text-white shadow-md" 
                          : "text-brand-text hover:bg-brand-line/30"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-line bg-white text-brand-text hover:bg-[#F8F9FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
