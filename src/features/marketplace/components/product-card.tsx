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
            className="group flex flex-col bg-white overflow-hidden  border border-brand-line transition-all duration-300 hover:shadow-xl hover:shadow-brand-ink/5 hover:-translate-y-1"
        >
            {/* Thumbnail */}
            <div className="relative aspect-square w-full bg-white flex items-center justify-center overflow-hidden">
                <img
                    src={product.imageThumbnail || "https://images.unsplash.com/photo-1610419207601-a56f8fd4a565?q=80&w=1887&auto=format&fit=crop"}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1610419207601-a56f8fd4a565?q=80&w=1887&auto=format&fit=crop";
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-brand-ink/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-brand-text uppercase tracking-widest shadow-sm">
                            Habis
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-center justify-between mb-1">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-brand-text-soft truncate pr-2">
                        {product.merchant?.businessName || "Mitra UMKM"}
                    </p>
                    <span className={`shrink-0 font-mono text-[10px] ${isOutOfStock ? "text-red-500" : "text-brand-moss"}`}>
                        {isOutOfStock ? "Habis" : `Stok: ${product.stock}`}
                    </span>
                </div>

                <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-brand-text leading-snug mb-3 group-hover:text-brand-forest transition-colors">
                    {product.name}
                </h3>

                <div className="mt-auto pt-2 flex items-center justify-between">
                    <p className="font-display text-base sm:text-lg font-bold text-brand-text">
                        {formattedPrice}
                    </p>
                    {/* Quick Add Icon (Visual only) */}
                    <div className="h-8 w-8 rounded-full bg-[#fcf3e6] flex items-center justify-center text-[#c59c6b] transition-colors group-hover:bg-[#c59c6b] group-hover:text-white shadow-sm">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}
