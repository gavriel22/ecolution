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
      price: "150 Poin",
      merchant: "Eco Clean Store",
      rating: 4.8,
      badge: "Baru",
      image: "https://images.unsplash.com/photo-1596568916388-3ef0b79ec508?q=80&w=2080&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Tas Belanja Rajut Ramah Lingkungan",
      price: "100 Poin",
      merchant: "Green Earth Indonesia",
      rating: 4.9,
      badge: "Terlaris",
      image: "https://images.unsplash.com/photo-1610419207601-a56f8fd4a565?q=80&w=1887&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Bungkus Makanan Lilin Lebah",
      price: "250 Poin",
      merchant: "Organic Wrap Co",
      rating: 4.7,
      badge: "Diskon",
      image: "https://images.unsplash.com/photo-1628189855577-ce6dcff03cb9?q=80&w=1969&auto=format&fit=crop",
    },
    {
      id: 4,
      name: "Sponge Mandi Serabut Labu (Loofah)",
      price: "80 Poin",
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
    <section className="py-24 bg-white font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl text-[#2c3d25] font-bold tracking-tight">Katalog Populer</h2>
            <p className="text-sm text-gray-500 mt-2">Dukung UMKM mitra kami dengan menukarkan poin hasil aksi ramah lingkungan Anda.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/marketplace" className="px-6 py-3 rounded-full border border-[#2c3d25] text-[#2c3d25] font-semibold hover:bg-[#2c3d25] hover:text-white transition-colors ml-4 hidden md:block">
              Lihat Semua
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col bg-paper-50 rounded-[30px] border border-paper-150 overflow-hidden shadow-xs hover:shadow-md transition">
              <div className="aspect-[4/5] bg-gray-100 overflow-hidden group relative">
                {product.badge && (
                  <span className={`absolute top-4 left-4 z-10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${badgeColors[product.badge] || "bg-ink-900 text-white"}`}>
                    {product.badge}
                  </span>
                )}
                <ProductImageWithFallback src={product.image} alt={product.name} />
              </div>
              
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">{product.name}</h3>
                  </div>
                  <p className="text-[11px] text-moss-700 font-bold mt-1">🏪 {product.merchant}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1 text-xs text-ochre-650 font-bold">
                    <Star className="w-3.5 h-3.5 fill-ochre-500 text-ochre-500" />
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="border-t border-paper-200 pt-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">Harga Penukaran</p>
                    <p className="text-sm font-black text-moss-800 font-mono">{product.price}</p>
                  </div>
                  
                  <Link 
                    href={`/marketplace/${product.id}`}
                    className="px-4 py-2 bg-moss-700 hover:bg-moss-900 text-white text-xs font-bold rounded-xl transition shadow-sm"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View all */}
        <div className="mt-10 flex justify-center md:hidden">
          <Link href="/marketplace" className="px-8 py-3 rounded-full border border-[#2c3d25] text-[#2c3d25] font-semibold hover:bg-[#2c3d25] hover:text-white transition-colors">
            Lihat Semua
          </Link>
        </div>
      </div>
    </section>
  );
}
