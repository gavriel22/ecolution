"use client";

import Link from "next/link";
import { useProducts } from "@/features/marketplace/hooks/use-products";
import { ProductCard } from "@/features/marketplace/components/product-card";

export function MarketplacePreview() {
  // Ambil 6 produk terlaris yang berstatus AVAILABLE dari database
  const { data, isLoading } = useProducts({ limit: 6, status: "AVAILABLE", sortBy: "sales", sortOrder: "desc" });
  const products = data?.products || [];

  return (
    <section className="py-[88px] bg-white font-sans">
      <div className="max-w-[1180px] mx-auto px-8 md:px-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
          <div className="space-y-2 text-left">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-gold-deep flex items-center gap-2">
              <span className="inline-block w-[22px] h-[1px] bg-brand-gold-deep" />
              Produk Pilihan
            </p>
            <h2 className="font-display text-3xl font-semibold text-brand-text leading-tight">
              Produk Terlaris Pekan Ini
            </h2>
            <p className="font-body text-[15px] text-brand-text-soft max-w-xl leading-relaxed">
              Dukung gerakan zero-waste dengan menukarkan poin ramah lingkunganmu dengan barang berkelanjutan langsung dari mitra UMKM kami.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="px-6 py-3 border border-brand-forest text-brand-forest font-bold rounded-md hover:bg-brand-forest hover:text-white transition duration-300 text-xs shadow-xs hidden sm:inline-block shrink-0"
          >
            Lihat Semua Produk
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            /* Loading Skeleton */
            Array.from({ length: 6 }).map((_, i) => (
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
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-brand-text-soft">
              Belum ada produk ramah lingkungan yang tersedia saat ini.
            </div>
          )}
        </div>

        {/* Mobile View all */}
        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            href="/marketplace"
            className="w-full text-center py-3 border border-brand-forest text-brand-forest font-bold rounded-md hover:bg-brand-forest hover:text-white transition duration-300 text-xs"
          >
            Lihat Semua Produk
          </Link>
        </div>
      </div>
    </section>
  );
}
