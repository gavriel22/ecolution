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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
            Marketplace UMKM
          </h1>
          <p className="font-body text-sm text-ink-400 mt-1">
            Gunakan poin hasil daur ulang dan aksi lingkunganmu untuk membeli produk ramah lingkungan.
          </p>
        </div>
        <Link
          href="/cart"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-moss-700 px-4 py-2 text-sm font-medium text-paper-50 transition-all hover:bg-moss-900 shadow-sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Keranjang Belanja
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Pencarian</label>
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-paper-200 bg-white px-3 py-1.5 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
            />
          </div>

          {/* Min Price */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Harga Minimum (Rp)</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice || ""}
              onChange={(e) => {
                setMinPrice(e.target.value ? Number(e.target.value) : undefined);
                setPage(1);
              }}
              className="w-full rounded-md border border-paper-200 bg-white px-3 py-1.5 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
            />
          </div>

          {/* Max Price */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Harga Maksimum (Rp)</label>
            <input
              type="number"
              placeholder="Maksimum"
              value={maxPrice || ""}
              onChange={(e) => {
                setMaxPrice(e.target.value ? Number(e.target.value) : undefined);
                setPage(1);
              }}
              className="w-full rounded-md border border-paper-200 bg-white px-3 py-1.5 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
            />
          </div>

          {/* Sort */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Urutkan</label>
            <select
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full rounded-md border border-paper-200 bg-white px-3 py-1.5 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
            >
              <option value="latest">Terbaru</option>
              <option value="price_asc">Harga: Rendah ke Tinggi</option>
              <option value="price_desc">Harga: Tinggi ke Rendah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      {isError && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-4 text-center text-sm text-rust-600">
          Gagal memuat produk. Silakan refresh halaman.
        </div>
      )}

      {isLoading ? (
        /* Loading Skeleton */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-paper-200 bg-white overflow-hidden space-y-3">
              <div className="aspect-square bg-paper-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-1/3 rounded-xs bg-paper-100" />
                <div className="h-4 w-3/4 rounded-xs bg-paper-100" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-5 w-2/5 rounded-xs bg-paper-100" />
                  <div className="h-3 w-1/5 rounded-xs bg-paper-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="rounded-lg border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400">
          <svg className="mx-auto h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="mt-3 text-base font-semibold text-ink-900">Produk Tidak Ditemukan</h3>
          <p className="mt-1 text-sm">Tidak ada produk yang cocok dengan pencarian atau filter harga Anda.</p>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
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
