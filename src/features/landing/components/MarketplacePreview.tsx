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
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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

  const badgeColors: Record<string, string> = {
    Baru: "bg-moss-700 text-white",
    Terlaris: "bg-[#fbbc04] text-gray-900",
    Diskon: "bg-rust-600 text-white",
  };

  return (
    <section className="py-20 md:py-24 bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
          <div className="space-y-3">
            <h2 className="text-xs font-bold tracking-widest text-moss-700 uppercase">
              Katalog Populer
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight leading-tight">
              Tukar Poin dengan Produk Hijau
            </h3>
            <p className="text-sm text-ink-400 max-w-xl">
              Dukung gerakan zero-waste dengan menukarkan poin ramah lingkunganmu dengan barang berkelanjutan langsung dari mitra UMKM kami.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="px-6 py-3 border border-moss-700 text-moss-700 font-bold rounded-xl hover:bg-moss-700 hover:text-white transition duration-300 shadow-xs hidden sm:inline-block shrink-0"
          >
            Lihat Semua Produk
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col bg-white rounded-3xl border border-paper-200 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
            >
              {/* Product Thumbnail container */}
              <div className="aspect-[4/4] bg-paper-50 overflow-hidden relative">
                {product.badge && (
                  <span className={`absolute top-4 left-4 z-10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${badgeColors[product.badge] || "bg-ink-900 text-white"}`}>
                    {product.badge}
                  </span>
                )}
                <ProductImageWithFallback src={product.image} alt={product.name} />
              </div>

              {/* Product Info */}
              <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between border-t border-paper-100">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-moss-700">
                    <span className="flex items-center gap-1">🏪 {product.merchant}</span>
                    <span className="flex items-center gap-0.5 text-ochre-700">
                      <Star className="w-3.5 h-3.5 fill-ochre-500 text-ochre-500" />
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-ink-900 line-clamp-2 leading-tight min-h-[40px] group-hover:text-moss-700 transition-colors">
                    {product.name}
                  </h4>
                </div>

                <div className="border-t border-paper-100 pt-3.5 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-ink-400 uppercase tracking-widest font-bold">Harga Poin</p>
                    <p className="text-base font-black text-moss-700 font-mono tracking-tight">{product.price}</p>
                  </div>

                  <Link
                    href={`/marketplace/${product.id}`}
                    className="px-4 py-2 bg-moss-700 hover:bg-moss-900 text-white text-xs font-bold rounded-xl transition duration-300 shadow-xs"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View all */}
        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            href="/marketplace"
            className="w-full text-center py-3 border border-moss-700 text-moss-700 font-bold rounded-xl hover:bg-moss-700 hover:text-white transition duration-300 shadow-xs"
          >
            Lihat Semua Produk
          </Link>
        </div>
      </div>
    </section>
  );
}
