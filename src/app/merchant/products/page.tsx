"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useProducts } from "@/features/marketplace/hooks/use-products";
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/features/marketplace/hooks/use-marketplace-mutations";
import { ApiError } from "@/lib/api-client";
import type { Product, ProductStatus } from "@/features/marketplace/types";
import { toast } from "sonner";
import { useConfirm } from "@/providers/confirm-provider";

export default function MerchantProductsPage() {
  const { user } = useAuth();
  const confirm = useConfirm();

  // 1. Fetch all merchants to find the logged-in user's merchant profile
  const { data: merchants = [], isLoading: isLoadingMerchants } = useQuery({
    queryKey: ["merchants"],
    queryFn: async () => {
      const res = await apiFetch<any[]>("/api/merchant");
      return res.data;
    },
    enabled: !!user,
  });

  const myMerchant = merchants.find((m) => m.ownerId === user?.id);

  // 2. Fetch products belonging to my merchant
  const { data, isLoading: isLoadingProducts, refetch } = useProducts({
    merchantId: myMerchant?.id,
  });

  const products = data?.products || [];

  // Mutations
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [imageThumbnail, setImageThumbnail] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProductStatus>("AVAILABLE");

  // Auth check
  if (!user || (user.role !== "UMKM" && user.role !== "ADMIN")) {
    return (
      <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-8 text-center text-sm font-semibold text-rust-600 font-body">
        Akses Ditolak. Halaman ini hanya dapat diakses oleh Mitra UMKM Ecolution yang sah.
      </div>
    );
  }

  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setPrice(0);
    setStock(0);
    setImageThumbnail("");
    setDescription("");
    setStatus("AVAILABLE");
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price);
    setStock(product.stock);
    setImageThumbnail(product.imageThumbnail || "");
    setDescription(product.description || "");
    setStatus(product.status);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (await confirm("Apakah Anda yakin ingin menghapus produk ini secara permanen?")) {
      deleteProductMutation.mutate(id, {
        onSuccess: () => {
          refetch();
          toast.success("Produk berhasil dihapus!");
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Gagal menghapus produk.");
        },
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client validation
    if (name.trim().length < 3) {
      setErrorMsg("Nama produk minimal 3 karakter");
      return;
    }
    if (price <= 0) {
      setErrorMsg("Harga produk harus lebih besar dari 0");
      return;
    }
    if (stock < 0) {
      setErrorMsg("Stok produk tidak boleh negatif");
      return;
    }

    const payload = {
      name: name.trim(),
      price,
      stock,
      imageThumbnail: imageThumbnail.trim() || null,
      description: description.trim() || null,
      images: imageThumbnail.trim() ? [imageThumbnail.trim()] : [],
    };

    if (editingProduct) {
      updateProductMutation.mutate(
        {
          id: editingProduct.id,
          payload: { ...payload, status },
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            refetch();
            toast.success("Produk berhasil diperbarui!");
          },
          onError: (err) => {
            setErrorMsg(err instanceof ApiError ? err.message : "Gagal memperbarui produk.");
          },
        }
      );
    } else {
      createProductMutation.mutate(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          refetch();
          toast.success("Produk berhasil ditambahkan!");
        },
        onError: (err) => {
          setErrorMsg(err instanceof ApiError ? err.message : "Gagal membuat produk baru.");
        },
      });
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const isMutating =
    createProductMutation.isPending ||
    updateProductMutation.isPending ||
    deleteProductMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
            Kelola Produk
          </h1>
          <p className="font-body text-sm text-ink-400 mt-1">
            Tambah, edit, atau hapus katalog produk ramah lingkungan milik UMKM Anda.
          </p>
        </div>
        {myMerchant && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-moss-700 px-4 py-2 text-sm font-medium text-paper-50 transition-all hover:bg-moss-900 shadow-sm self-start sm:self-auto"
          >
            + Tambah Produk
          </button>
        )}
      </div>

      {/* Profile missing/loading fallback */}
      {isLoadingMerchants ? (
        <div className="animate-pulse h-20 rounded bg-paper-100" />
      ) : !myMerchant ? (
        <div className="rounded-lg border border-paper-200 bg-white p-6 text-center font-body text-sm text-ink-700">
          <p className="font-semibold text-ink-900">Profil UMKM Belum Terdaftar</p>
          <p className="mt-1 text-ink-400">Silakan daftarkan profil merchant Anda terlebih dahulu untuk mulai menjual produk.</p>
        </div>
      ) : (
        /* Inventory Table */
        <div className="rounded-lg border border-paper-200 bg-white shadow-xs overflow-x-auto">
          {isLoadingProducts ? (
            <div className="animate-pulse p-10 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 rounded bg-paper-50" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-ink-400 font-body">
              <svg className="mx-auto h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-3 text-base font-semibold text-ink-900">Belum Ada Produk</h3>
              <p className="mt-1 text-sm">Mulai pasang produk dagangan pertama Anda.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-body">
              <thead>
                <tr className="border-b border-paper-100 bg-paper-50/50 font-mono text-[10px] uppercase tracking-wider text-ink-400">
                  <th className="px-5 py-3 font-semibold">Produk</th>
                  <th className="px-5 py-3 font-semibold">Harga</th>
                  <th className="px-5 py-3 font-semibold">Stok</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-100 text-sm text-ink-700">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-paper-50/40">
                    <td className="px-5 py-3 flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-paper-100 bg-paper-50 flex items-center justify-center">
                        {prod.imageThumbnail ? (
                          <img src={prod.imageThumbnail} alt={prod.name} className="h-full w-full object-cover" />
                        ) : (
                          <svg className="h-5 w-5 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <span className="font-semibold text-ink-900 truncate max-w-[200px]" title={prod.name}>
                        {prod.name}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-moss-700">
                      {formatPrice(prod.price)}
                    </td>
                    <td className="px-5 py-3 font-mono">
                      {prod.stock} unit
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block rounded-xs px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider border ${
                        prod.status === "AVAILABLE" ? "bg-moss-50 border-moss-200 text-moss-700" : "bg-rust-50 border-rust-200 text-rust-600"
                      }`}>
                        {prod.status === "AVAILABLE" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="rounded-md border border-paper-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-paper-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="rounded-md border border-rust-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rust-600 hover:bg-rust-50 transition"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* CRUD Product Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-lg border border-paper-200 bg-white p-6 shadow-xl font-body space-y-4 animate-scale-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-paper-100 pb-3">
              <h3 className="font-display text-lg font-bold text-ink-900">
                {editingProduct ? "Edit Informasi Produk" : "Tambah Produk Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink-400 hover:text-ink-900 font-mono text-xl"
              >
                &times;
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-md border border-rust-500/30 bg-rust-500/5 px-3 py-2 text-xs text-rust-600">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Live Image Preview */}
              <div className="flex gap-4 items-center">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded border border-paper-200 bg-paper-50 flex items-center justify-center">
                  {imageThumbnail && imageThumbnail.trim().startsWith("http") ? (
                    <img src={imageThumbnail} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-ink-400 uppercase tracking-wider text-center px-1 font-mono">No Preview</span>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <label htmlFor="imageUrl" className="text-xs font-semibold uppercase tracking-wider text-ink-400">URL Gambar</label>
                  <input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageThumbnail}
                    onChange={(e) => setImageThumbnail(e.target.value)}
                    className="w-full rounded-md border border-paper-200 bg-white px-3 py-1.5 text-xs text-ink-900 outline-none focus:border-moss-500"
                  />
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label htmlFor="prodName" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Nama Produk</label>
                <input
                  id="prodName"
                  required
                  type="text"
                  placeholder="Contoh: Tas Daur Ulang Kanvas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-1">
                  <label htmlFor="prodPrice" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Harga (Rp)</label>
                  <input
                    id="prodPrice"
                    required
                    type="number"
                    min="1"
                    placeholder="10000"
                    value={price || ""}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                  />
                </div>

                {/* Stock */}
                <div className="space-y-1">
                  <label htmlFor="prodStock" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Stok Awal</label>
                  <input
                    id="prodStock"
                    required
                    type="number"
                    min="0"
                    placeholder="50"
                    value={stock === 0 && editingProduct === null ? "" : stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                  />
                </div>
              </div>

              {/* Status (Edit only) */}
              {editingProduct && (
                <div className="space-y-1">
                  <label htmlFor="prodStatus" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Status Penjualan</label>
                  <select
                    id="prodStatus"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProductStatus)}
                    className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                  >
                    <option value="AVAILABLE">Tersedia / Aktif</option>
                    <option value="OUT_OF_STOCK">Habis Terjual</option>
                    <option value="INACTIVE">Nonaktif / Draft</option>
                  </select>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <label htmlFor="prodDesc" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Deskripsi Detail</label>
                <textarea
                  id="prodDesc"
                  rows={3}
                  placeholder="Jelaskan spesifikasi produk Anda..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-paper-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-md border border-paper-200 bg-white py-2 text-sm font-semibold text-ink-700 hover:bg-paper-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="flex-1 rounded-md bg-moss-700 py-2 text-sm font-semibold text-paper-50 hover:bg-moss-900 transition disabled:opacity-50"
                >
                  {isMutating ? "Menyimpan..." : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
