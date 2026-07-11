"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProduct } from "@/features/marketplace/hooks/use-product";
import { useAuth } from "@/context/auth-context";

interface CartItem {
  id: string;
  name: string;
  price: number;
  imageThumbnail: string | null;
  quantity: number;
  stock: number;
  merchantName: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading, isError } = useProduct(id);
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const cartKey = user ? `ecolution_cart_${user.id}` : "ecolution_cart_guest";

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <p className="text-red-600 mb-4 font-medium">Gagal memuat detail produk. Silakan kembali ke katalog.</p>
          <Link href="/marketplace" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-brand-line rounded-xl text-brand-text font-semibold hover:bg-gray-50 transition-colors">
            ← Kembali ke Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
        <div className="h-4 w-48 rounded bg-brand-line/50" />
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7 aspect-[4/3] rounded-3xl bg-brand-line/30" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-4 w-32 rounded bg-brand-line/50" />
            <div className="h-10 w-3/4 rounded bg-brand-line/50" />
            <div className="h-8 w-1/3 rounded bg-brand-line/50" />
            <div className="h-px w-full bg-brand-line/30 my-8" />
            <div className="h-32 w-full rounded bg-brand-line/50" />
            <div className="h-12 w-full rounded-xl bg-brand-line/50 mt-8" />
          </div>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(product.price);

  const imagesList = product.images.map((img) => img.imageUrl) || [];
  if (product.imageThumbnail && !imagesList.includes(product.imageThumbnail)) {
    imagesList.unshift(product.imageThumbnail);
  }

  const displayImage = activeImage || product.imageThumbnail || "/placeholder.png";
  const isOutOfStock = product.stock <= 0 || product.status === "OUT_OF_STOCK";

  const handleAddToCart = (redirect: boolean) => {
    if (isOutOfStock) return;

    const cart: CartItem[] = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const existingIndex = cart.findIndex((item) => item.id === product.id);

    if (existingIndex > -1) {
      const nextQty = Math.min(product.stock, cart[existingIndex].quantity + quantity);
      cart[existingIndex].quantity = nextQty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageThumbnail: product.imageThumbnail,
        quantity,
        stock: product.stock,
        merchantName: product.merchant?.businessName || "Mitra UMKM",
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));

    if (redirect) {
      router.push("/cart");
    } else {
      setSuccessMsg("Produk berhasil ditambahkan ke keranjang!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-3 text-[13px] font-medium text-brand-text-soft">
          <Link href="/marketplace" className="hover:text-brand-forest transition-colors">Marketplace</Link>
          <span className="text-brand-line-strong">•</span>
          {product.merchantId && (
             <Link href={`/merchant/${product.merchantId}`} className="hover:text-brand-forest transition-colors">
               {product.merchant?.businessName || "Mitra UMKM"}
             </Link>
          )}
          {!product.merchantId && <span>{product.merchant?.businessName || "Mitra UMKM"}</span>}
          <span className="text-brand-line-strong">•</span>
          <span className="text-brand-text truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </nav>

        {/* Success Notification */}
        {successMsg && (
          <div className="rounded-xl border border-brand-moss bg-brand-moss-light/20 px-6 py-4 text-sm font-bold text-brand-forest shadow-sm animate-fade-in flex justify-between items-center">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-brand-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMsg}</span>
            </div>
            <Link href="/cart" className="bg-white px-4 py-1.5 rounded-lg border border-brand-moss/30 hover:bg-brand-moss-light/10 transition-colors">
              Lihat Keranjang
            </Link>
          </div>
        )}

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/3] w-full rounded-3xl bg-[#F8F9FA] flex items-center justify-center overflow-hidden border border-brand-line">
              {displayImage && displayImage !== "/placeholder.png" ? (
                <img
                  src={displayImage}
                  alt={product.name}
                  decoding="async"
                  onError={(e) => {
                    if (e.currentTarget.src !== window.location.origin + "/placeholder.png") {
                      e.currentTarget.src = "/placeholder.png";
                    }
                  }}
                  className="h-full w-full object-cover object-center transition-opacity duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-brand-text-soft">
                  <svg className="h-16 w-16 opacity-40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs uppercase font-mono tracking-widest font-semibold">Tidak Ada Foto</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {imagesList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {imagesList.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(url)}
                    className={`aspect-square w-20 sm:w-24 shrink-0 rounded-2xl overflow-hidden transition-all duration-200 border-2 ${
                      displayImage === url 
                        ? "border-brand-forest shadow-md scale-100" 
                        : "border-transparent bg-[#F8F9FA] hover:border-brand-line hover:scale-[1.02]"
                    }`}
                  >
                    <img loading="lazy" decoding="async" src={url} alt={`Thumbnail ${i}`} className="h-full w-full object-cover mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Info & Buy Section */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="space-y-6">
              
              {/* Brand Header */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-brand-forest flex items-center justify-center text-white text-xs font-bold">
                  {(product.merchant?.businessName || "M").charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  {product.merchantId ? (
                    <Link
                      href={`/merchant/${product.merchantId}`}
                      className="text-sm font-bold text-brand-text hover:text-brand-forest transition-colors"
                    >
                      {product.merchant?.businessName || "Mitra UMKM"}
                    </Link>
                  ) : (
                    <span className="text-sm font-bold text-brand-text">
                      {product.merchant?.businessName || "Mitra UMKM"}
                    </span>
                  )}
                  <span className="text-[10px] text-brand-text-soft font-mono uppercase tracking-widest">Penjual Terverifikasi</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-display text-3xl sm:text-4xl font-black text-brand-text leading-[1.1] tracking-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-end gap-3">
                <p className="font-display text-4xl font-bold text-brand-forest">
                  {formattedPrice}
                </p>
                {isOutOfStock && (
                  <span className="mb-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 uppercase tracking-widest">
                    Habis Terjual
                  </span>
                )}
              </div>

              <div className="h-px w-full bg-brand-line/50 my-8" />

              {/* Stock and Qty */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-brand-text">Pilih Jumlah</span>
                  <span className={`text-sm font-semibold ${isOutOfStock ? "text-red-500" : "text-brand-text-soft"}`}>
                    Sisa stok: {product.stock}
                  </span>
                </div>

                {!isOutOfStock && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-brand-line rounded-xl bg-white overflow-hidden w-36 h-12">
                      <button
                        disabled={quantity <= 1}
                        onClick={() => setQuantity((q) => q - 1)}
                        className="flex-1 h-full flex items-center justify-center text-xl font-medium text-brand-text hover:bg-[#F8F9FA] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-bold text-brand-text select-none">
                        {quantity}
                      </span>
                      <button
                        disabled={quantity >= product.stock}
                        onClick={() => setQuantity((q) => q + 1)}
                        className="flex-1 h-full flex items-center justify-center text-xl font-medium text-brand-text hover:bg-[#F8F9FA] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  disabled={isOutOfStock}
                  onClick={() => handleAddToCart(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-brand-forest bg-white py-4 text-base font-bold text-brand-forest hover:bg-brand-paper transition-all duration-300 disabled:opacity-50 disabled:border-brand-line disabled:text-brand-text-soft disabled:hover:bg-white"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Tambah Keranjang
                </button>
                <button
                  disabled={isOutOfStock}
                  onClick={() => handleAddToCart(true)}
                  className="flex items-center justify-center rounded-xl bg-brand-forest py-4 text-base font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-brand-forest-2 transition-all duration-300 disabled:opacity-50 disabled:shadow-none disabled:transform-none"
                >
                  Beli Sekarang
                </button>
              </div>

              {/* Delivery Info */}
              <div className="pt-6 flex items-center gap-3 text-sm text-brand-text-soft">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Dukung UMKM lokal dengan produk ramah lingkungan.</span>
              </div>

              <div className="h-px w-full bg-brand-line/50 my-6" />

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-brand-text">Deskripsi Produk</h3>
                <p className="font-body text-base text-brand-text-soft whitespace-pre-wrap leading-relaxed">
                  {product.description || "Tidak ada deskripsi produk yang tersedia."}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
