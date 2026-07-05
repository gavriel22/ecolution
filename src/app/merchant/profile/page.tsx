"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { useConfirm } from "@/providers/confirm-provider";

export default function MerchantProfilePage() {
  const confirmDialog = useConfirm();
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState("");
  const [operasionalHours, setOperasionalHours] = useState("");

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    apiFetch<any>("/api/merchant/my")
      .then((res) => {
        setMerchant(res.data.merchant);
      })
      .catch((err) => {
        console.error("Failed to load merchant profile", err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartEdit = () => {
    if (merchant) {
      setBusinessName(merchant.businessName || "");
      setDescription(merchant.description || "");
      setLogoUrl(merchant.logoUrl || "");
      setAddress(merchant.address || "");
      setPhone(merchant.phone || "");
      setEmail(merchant.email || "");
      setWebsite(merchant.website || "");
      setCategory(merchant.category || "");
      setOperasionalHours(merchant.operasionalHours || "");
    } else {
      // Clear for create
      setBusinessName("");
      setDescription("");
      setLogoUrl("");
      setAddress("");
      setPhone("");
      setEmail("");
      setWebsite("");
      setCategory("");
      setOperasionalHours("");
    }
    setErrorMsg(null);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setErrorMsg("Nama toko wajib diisi");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const bodyData = {
      businessName: businessName.trim(),
      description: description.trim() || null,
      logoUrl: logoUrl.trim() || null,
      address: address.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      website: website.trim() || null,
      category: category.trim() || null,
      operasionalHours: operasionalHours.trim() || null,
    };

    try {
      if (merchant) {
        // Update
        const res = await apiFetch<any>(`/api/merchant/${merchant.id}`, {
          method: "PUT",
          body: bodyData,
        });
        setMerchant(res.data.data || res.data);
        toast.success("Profil toko berhasil diperbarui!");
      } else {
        // Create
        const res = await apiFetch<any>("/api/merchant", {
          method: "POST",
          body: bodyData,
        });
        setMerchant(res.data.data || res.data);
        toast.success("Profil toko berhasil dibuat!");
      }
      setIsEditing(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal menyimpan data toko.");
      toast.error(err.message || "Gagal menyimpan data toko.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!merchant) return;
    const confirmDelete = await confirmDialog(
      "Apakah Anda yakin ingin menghapus profil toko Anda? Semua produk yang terdaftar akan dihapus jika tidak ada transaksi."
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await apiFetch<any>(`/api/merchant/${merchant.id}`, {
        method: "DELETE",
      });
      setMerchant(null);
      setIsEditing(false);
      toast.success("Profil toko berhasil dihapus.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal menghapus profil toko. Pastikan toko tidak memiliki produk aktif.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-6 text-center text-sm text-rust-600 font-body">
        Gagal memuat profil toko. Silakan refresh halaman.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 font-body">
        <div className="animate-pulse space-y-3">
          <div className="h-24 w-24 bg-paper-100 rounded-full" />
          <div className="h-8 w-48 bg-paper-100 rounded" />
          <div className="h-4 w-72 bg-paper-100 rounded" />
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const statusColors: Record<string, string> = {
    APPROVED: "bg-moss-100 border-moss-300 text-moss-700",
    PENDING: "bg-ochre-100 border-ochre-300 text-ochre-700",
    REJECTED: "bg-rust-100 border-rust-300 text-rust-700",
    SUSPENDED: "bg-rust-100 border-rust-350 text-rust-800",
  };

  const statusLabels: Record<string, string> = {
    APPROVED: "Terverifikasi (Aktif)",
    PENDING: "Menunggu Persetujuan Admin",
    REJECTED: "Ditolak",
    SUSPENDED: "Ditangguhkan",
  };

  return (
    <div className="space-y-8 font-body">
      {/* Mode Read (Melihat Toko) */}
      {!isEditing && merchant && (
        <>
          <div className="rounded-lg border border-paper-200 bg-white p-6 shadow-xs flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-5 items-center text-center md:text-left">
              <div className="h-24 w-24 shrink-0 rounded-full border border-paper-200 overflow-hidden bg-paper-50 flex items-center justify-center">
                {merchant.logoUrl ? (
                  <img src={merchant.logoUrl} alt={merchant.businessName} className="h-full w-full object-cover" />
                ) : (
                  <svg className="h-10 w-10 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center">
                  <h1 className="font-display text-2xl font-bold text-ink-900 leading-tight">
                    {merchant.businessName}
                  </h1>
                  <span className={`inline-block border text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded ${statusColors[merchant.status] || "bg-paper-100 text-ink-500"}`}>
                    {statusLabels[merchant.status] || merchant.status}
                  </span>
                </div>
                <p className="text-sm text-ink-400 max-w-xl">{merchant.description || "Tidak ada deskripsi toko."}</p>
                <p className="text-xs text-ink-400 font-mono">Kategori: <span className="font-semibold text-moss-700">{merchant.category || "General"}</span></p>
                <p className="text-xs text-ink-455 font-mono">Toko Terdaftar Sejak: {formatDate(merchant.createdAt)}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 w-full md:w-auto">
              <button
                onClick={handleStartEdit}
                className="rounded-md bg-moss-700 px-5 py-2 text-xs font-semibold text-paper-50 hover:bg-moss-900 transition shadow-sm"
              >
                Edit Profil Toko
              </button>
              <button
                onClick={handleDelete}
                className="rounded-md border border-rust-200 bg-white px-5 py-2 text-xs font-semibold text-rust-600 hover:bg-rust-50 transition"
              >
                Hapus Profil Toko
              </button>
            </div>
          </div>

          {/* Grid Detail Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-paper-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="font-display text-lg font-bold text-ink-900 border-b border-paper-100 pb-2">
                Informasi Bisnis & Kontak
              </h2>
              <div className="grid grid-cols-1 gap-3.5 text-sm text-ink-700">
                <div className="grid grid-cols-3">
                  <span className="text-ink-400 font-medium">Email Bisnis</span>
                  <span className="col-span-2 font-mono break-all">{merchant.email || "-"}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-ink-400 font-medium">Nomor Telepon</span>
                  <span className="col-span-2 font-mono">{merchant.phone || "-"}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-ink-400 font-medium">Website</span>
                  <span className="col-span-2 font-mono text-moss-700 hover:underline">
                    {merchant.website ? (
                      <a href={merchant.website} target="_blank" rel="noopener noreferrer">{merchant.website}</a>
                    ) : "-"}
                  </span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-ink-400 font-medium">Alamat Toko</span>
                  <span className="col-span-2 leading-relaxed">{merchant.address || "-"}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-ink-400 font-medium">Jam Operasional</span>
                  <span className="col-span-2 font-mono">{merchant.operasionalHours || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mode Empty (Belum memiliki toko) */}
      {!isEditing && !merchant && (
        <div className="rounded-lg border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400 space-y-4">
          <svg className="mx-auto h-16 w-16 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h2 className="font-display text-xl font-bold text-ink-900">Profil Toko Belum Dibuat</h2>
          <p className="text-sm max-w-md mx-auto">
            Anda belum mengisi detail informasi usaha Mitra UMKM Anda. Buat profil toko sekarang agar produk Anda dapat dilihat oleh pembeli.
          </p>
          <button
            onClick={handleStartEdit}
            className="rounded-md bg-moss-700 px-6 py-2.5 text-xs font-semibold text-paper-50 hover:bg-moss-900 transition shadow-sm"
          >
            Buat Profil Toko
          </button>
        </div>
      )}

      {/* Mode Edit/Create Form */}
      {isEditing && (
        <div className="rounded-lg border border-paper-200 bg-white p-6 shadow-xs space-y-6">
          <h2 className="font-display text-xl font-bold text-ink-900 border-b border-paper-100 pb-3">
            {merchant ? "Edit Profil Toko" : "Buat Profil Toko Baru"}
          </h2>

          {errorMsg && (
            <div className="rounded-md border border-rust-500/30 bg-rust-500/5 px-4 py-2.5 text-sm text-rust-600">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo URL */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Tautan Logo Toko
              </label>
              <div className="flex gap-4 items-center">
                <div className="h-16 w-16 rounded-full overflow-hidden border border-paper-200 bg-paper-50 flex items-center justify-center">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-ink-300">No Image</span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="https://example.com/logo.jpg"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="flex-1 rounded-md border border-paper-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-moss-500"
                />
              </div>
            </div>

            {/* Nama Toko */}
            <div className="space-y-1.5">
              <label htmlFor="businessName" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Nama Toko <span className="text-rust-500">*</span>
              </label>
              <input
                id="businessName"
                type="text"
                required
                placeholder="Nama usaha Anda"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-md border border-paper-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-moss-500"
              />
            </div>

            {/* Kategori Toko */}
            <div className="space-y-1.5">
              <label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Kategori Usaha
              </label>
              <input
                id="category"
                type="text"
                placeholder="Contoh: Kerajinan Tangan, Makanan Organik"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-paper-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-moss-500"
              />
            </div>

            {/* Nomor HP */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Nomor Telepon
              </label>
              <input
                id="phone"
                type="text"
                placeholder="08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-paper-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-moss-500"
              />
            </div>

            {/* Email Bisnis */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Email Bisnis
              </label>
              <input
                id="email"
                type="email"
                placeholder="toko@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-paper-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-moss-500"
              />
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <label htmlFor="website" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Website Toko
              </label>
              <input
                id="website"
                type="text"
                placeholder="https://toko.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-md border border-paper-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-moss-500"
              />
            </div>

            {/* Jam Operasional */}
            <div className="space-y-1.5">
              <label htmlFor="operasionalHours" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Jam Operasional
              </label>
              <input
                id="operasionalHours"
                type="text"
                placeholder="Contoh: Senin - Jumat, 08:00 - 17:00 WIB"
                value={operasionalHours}
                onChange={(e) => setOperasionalHours(e.target.value)}
                className="w-full rounded-md border border-paper-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-moss-500"
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Deskripsi Toko
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Ceritakan latar belakang usaha ramah lingkungan Anda..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-paper-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-moss-500"
              />
            </div>

            {/* Alamat */}
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Alamat Fisik Toko
              </label>
              <textarea
                id="address"
                rows={2}
                placeholder="Alamat lengkap toko Anda..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-md border border-paper-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-moss-500"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 md:col-span-2 pt-4 border-t border-paper-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 rounded-md border border-paper-200 bg-white py-3 text-xs font-semibold text-ink-700 hover:bg-paper-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-md bg-moss-700 py-3 text-xs font-semibold text-paper-50 hover:bg-moss-900 transition disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Profil Toko"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
