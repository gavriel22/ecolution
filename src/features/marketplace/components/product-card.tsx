"use client";

import Link from "next/link";
import type { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(product.price);

  const isOutOfStock = product.stock <= 0 || product.status === "OUT_OF_STOCK";

  return (
    <Link
      href={`/marketplace/${product.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-paper-200 bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:border-moss-500 hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative aspect-square w-full bg-paper-50 flex items-center justify-center overflow-hidden">
        {product.imageThumbnail ? (
          <img
            src={product.imageThumbnail}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-center transition duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-ink-400">
            <svg className="h-10 w-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] uppercase font-mono tracking-wider mt-1.5">No Photo</span>
          </div>
        )}
        
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="rounded-xs bg-rust-600 px-2 py-1 font-mono text-[10px] font-bold text-white uppercase tracking-wider">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-1">
          <p className="font-mono text-[9px] uppercase tracking-wider text-ink-400">
            {product.merchant?.businessName || "Mitra UMKM"}
          </p>
          <h3 className="line-clamp-2 text-sm font-semibold text-ink-900 leading-tight">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-base font-bold text-moss-700">
            {formattedPrice}
          </p>
          <span className={`font-mono text-[10px] ${isOutOfStock ? "text-rust-600" : "text-ink-400"}`}>
            Stok: {product.stock}
          </span>
        </div>
      </div>
    </Link>
  );
}
