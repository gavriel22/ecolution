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
      <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-4 text-center text-sm text-rust-600">
        Gagal memuat detail produk. Silakan kembali ke katalog.
        <div className="mt-2">
          <Link href="/marketplace" className="text-moss-700 hover:underline font-semibold">
            ← Kembali ke Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-1/4 rounded bg-paper-100" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="aspect-square rounded-lg bg-paper-100" />
          <div className="space-y-4">
            <div className="h-4 w-1/3 rounded bg-paper-100" />
            <div className="h-8 w-3/4 rounded bg-paper-100" />
            <div className="h-6 w-1/4 rounded bg-paper-100" />
            <div className="h-20 w-full rounded bg-paper-100" />
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
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-ink-400">
        <Link href="/marketplace" className="hover:text-moss-700">Marketplace</Link>
        <span>/</span>
        <span className="text-ink-900 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Success Notification */}
      {successMsg && (
        <div className="rounded-md border border-moss-500/30 bg-moss-50 px-4 py-3 text-sm font-semibold text-moss-700 shadow-sm animate-fade-in flex justify-between items-center">
          <span>{successMsg}</span>
          <Link href="/cart" className="underline font-bold text-moss-900 hover:text-moss-700">
            Lihat Keranjang
          </Link>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left Column: Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-lg border border-paper-200 bg-white flex items-center justify-center overflow-hidden">
            <img
              src={displayImage}
              alt={product.name}
              decoding="async"
              onError={(e) => {
                if (e.currentTarget.src !== window.location.origin + "/placeholder.png") {
                  e.currentTarget.src = "/placeholder.png";
                }
              }}
              className="h-full w-full object-cover object-center"
            />
          </div>

          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imagesList.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(url)}
                  className={`aspect-square w-16 shrink-0 rounded border bg-white overflow-hidden transition ${
                    displayImage === url ? "border-moss-500 ring-2 ring-moss-500/20" : "border-paper-200 hover:border-moss-300"
                  }`}
                >
                  <img loading="lazy" decoding="async" src={url} alt={`Thumbnail ${i}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info & Buy Section */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Merchant */}
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-moss-500" />
              {product.merchantId ? (
                <Link
                  href={`/merchant/${product.merchantId}`}
                  className="font-mono text-xs uppercase tracking-wider text-moss-700 font-semibold hover:underline"
                >
                  {product.merchant?.businessName || "Mitra UMKM"}
                </Link>
              ) : (
                <p className="font-mono text-xs uppercase tracking-wider text-ink-700 font-semibold">
                  {product.merchant?.businessName || "Mitra UMKM"}
                </p>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl font-bold text-ink-900 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <p className="font-display text-2xl font-bold text-moss-700">
              {formattedPrice}
            </p>

            {/* Description */}
            <div className="border-t border-paper-200 pt-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400">Deskripsi Produk</h3>
              <p className="font-body text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">
                {product.description || "Tidak ada deskripsi produk."}
              </p>
            </div>
          </div>

          {/* Checkout box */}
          <div className="rounded-lg border border-paper-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink-700">Ketersediaan Stok</span>
              <span className={`font-mono font-bold ${isOutOfStock ? "text-rust-600" : "text-moss-700"}`}>
                {isOutOfStock ? "Habis Terjual" : `${product.stock} unit`}
              </span>
            </div>

            {/* Quantity Input */}
            {!isOutOfStock && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-700">Jumlah</span>
                <div className="flex items-center border border-paper-200 rounded-md bg-paper-50 h-9">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => q - 1)}
                    className="w-10 text-center font-mono text-lg font-bold text-ink-700 hover:text-moss-700 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-mono text-sm text-ink-900 font-semibold select-none">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= product.stock}
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 text-center font-mono text-lg font-bold text-ink-700 hover:text-moss-700 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                disabled={isOutOfStock}
                onClick={() => handleAddToCart(false)}
                className="flex items-center justify-center gap-2 rounded-md border border-paper-200 bg-white py-2.5 text-sm font-semibold text-ink-900 hover:bg-paper-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                + Keranjang
              </button>
              <button
                disabled={isOutOfStock}
                onClick={() => handleAddToCart(true)}
                className="flex items-center justify-center rounded-md bg-moss-700 py-2.5 text-sm font-semibold text-paper-50 hover:bg-moss-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
