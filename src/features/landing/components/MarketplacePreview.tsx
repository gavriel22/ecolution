"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import Link from "next/link";

interface ProductItem {
  id: number;
  name: string;
  price: string;
  merchant: string;
  rating: number;
  badge?: string | null;
  image: string;
}

function ProductImageWithFallback({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  const fallback = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop";

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallback)}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

export function MarketplacePreview() {
  const products: ProductItem[] = [
    {
      id: 1,
      name: "Sikat Cuci Piring Bambu",
      price: "150 Pts",
      merchant: "Eco Clean Store",
      rating: 4.8,
      badge: "Baru",
      image: "https://images.unsplash.com/photo-1596568916388-3ef0b79ec508?q=80&w=2080&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Tas Belanja Rajut Ramah Lingkungan",
      price: "100 Pts",
      merchant: "Green Earth Indonesia",
      rating: 4.9,
      badge: "Terlaris",
      image: "https://images.unsplash.com/photo-1610419207601-a56f8fd4a565?q=80&w=1887&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Bungkus Makanan Lilin Lebah",
      price: "250 Pts",
      merchant: "Organic Wrap Co",
      rating: 4.7,
      badge: "Diskon",
      image: "https://images.unsplash.com/photo-1628189855577-ce6dcff03cb9?q=80&w=1969&auto=format&fit=crop",
    },
    {
      id: 4,
      name: "Sponge Mandi Serabut Labu (Loofah)",
      price: "80 Pts",
      merchant: "Nature Care Bali",
      rating: 4.6,
      badge: null,
      image: "https://images.unsplash.com/photo-1606803716962-dcc0bb02f6bc?q=80&w=1974&auto=format&fit=crop",
    },
  ];

  return (
    <section className="py-[88px] bg-brand-paper font-sans">
      <div className="max-w-[1180px] mx-auto px-8 md:px-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
          <div className="space-y-2 text-left">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand-gold-deep flex items-center gap-2">
              <span className="inline-block w-[22px] h-[1px] bg-brand-gold-deep" />
              Spesimen Pilihan
            </p>
            <h2 className="font-display text-3xl font-semibold text-brand-text leading-tight">
              Katalog Produk Hijau Populer
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col bg-brand-paper rounded-xl border border-brand-line overflow-hidden transition-all duration-300"
            >
              {/* Product Thumbnail Container with Corner Ribbon */}
              <div className="aspect-[1/1] overflow-hidden relative border-b border-brand-line bg-brand-paper-2">
                {product.badge && (
                  <span className="absolute top-0 left-0 z-10 px-2.5 py-1 bg-brand-gold text-brand-text text-[9px] font-mono font-bold uppercase tracking-wider rounded-br-lg border-r border-b border-brand-line-strong">
                    {product.badge}
                  </span>
                )}
                <ProductImageWithFallback src={product.image} alt={product.name} />
              </div>

              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono text-brand-text-soft">
                    <span className="truncate">🏪 {product.merchant}</span>
                    <span className="flex items-center gap-0.5 text-brand-gold-deep shrink-0 font-bold">
                      <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                  <h4 className="font-display text-sm font-semibold text-brand-text line-clamp-2 leading-snug min-h-[40px]">
                    {product.name}
                  </h4>
                </div>

                <div className="space-y-3">
                  {/* Dashed line */}
                  <div className="border-t border-dashed border-brand-line-strong my-2"></div>

                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5 text-left">
                      <p className="font-mono text-[9px] text-brand-text-soft font-bold uppercase tracking-widest">
                        Tukar
                      </p>
                      <p className="font-mono text-sm font-bold text-brand-text leading-none">
                        {product.price}
                      </p>
                    </div>

                    <Link
                      href={`/marketplace/${product.id}`}
                      className="px-4 py-2 border border-brand-forest text-brand-forest hover:bg-brand-forest hover:text-white rounded-md text-xs font-semibold tracking-wide transition duration-200"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
