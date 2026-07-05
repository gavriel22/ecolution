"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api-client";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [merchant, setMerchant] = useState<any>(null);
  const [loadingMerchant, setLoadingMerchant] = useState(true);

  useEffect(() => {
    if (user && (user.role === "USER" || user.role === "UMKM")) {
      apiFetch<any>("/api/merchant/my")
        .then((res) => {
          setMerchant(res.data.merchant);
        })
        .catch((err) => {
          console.error("Failed to load merchant data", err);
        })
        .finally(() => {
          setLoadingMerchant(false);
        });
    } else {
      setLoadingMerchant(false);
    }
  }, [user]);

  if (isLoading || loadingMerchant) {
    return (
      <div className="flex h-[400px] items-center justify-center font-body text-sm text-ink-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-moss-200 border-t-moss-700"></div>
          <p className="font-mono text-xs text-ink-400">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const date = new Date(user.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "UMKM":
        return "Mitra UMKM";
      default:
        return "Anggota Penduduk";
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-rust-500 text-paper-50";
      case "UMKM":
        return "bg-ochre-500 text-ink-900";
      default:
        return "bg-moss-700 text-paper-50";
    }
  };

  return (
    <div className="space-y-8 font-body">
      <div>
        <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
          Profil Saya
        </h1>
        <p className="font-body text-sm text-ink-400 mt-1">
          Kelola informasi akun Anda dan pantau reputasi kontribusi Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="overflow-hidden rounded-lg border border-paper-200 bg-white shadow-xs">
            {/* Profile Card Header */}
            <div className="bg-moss-900 px-6 py-8 text-paper-50 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-paper-100 text-moss-900 font-display font-semibold text-3xl uppercase">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">{user.name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`rounded-xs px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeClass(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                  <span className="font-mono text-xs opacity-75">
                    Bergabung sejak {date}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Card Body */}
            <div className="p-6 divide-y divide-paper-100">
              <div className="flex justify-between py-4">
                <span className="text-sm font-semibold text-ink-400">Username</span>
                <span className="font-mono text-sm text-ink-900 font-medium">@{user.username}</span>
              </div>
              <div className="flex justify-between py-4">
                <span className="text-sm font-semibold text-ink-400">Email</span>
                <span className="text-sm text-ink-900 font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between py-4">
                <span className="text-sm font-semibold text-ink-400">Total Poin</span>
                <span className="font-mono text-sm font-bold text-moss-700">{user.totalPoint} Poin</span>
              </div>
              <div className="flex justify-between py-4">
                <span className="text-sm font-semibold text-ink-400">Skor Kepercayaan (Trust Score)</span>
                <span className="font-mono text-sm font-bold text-ochre-600">{user.trustScore}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* UMKM Section */}
        <div className="space-y-6">
          {user.role === "USER" && !merchant && (
            <div className="rounded-lg border border-moss-200 bg-moss-50/50 p-6 space-y-4 shadow-xs">
              <h3 className="font-display text-lg font-bold text-moss-900">Mulai Berjualan</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Ingin berkontribusi lebih dengan menjual produk ramah lingkungan buatan sendiri? Daftarkan usaha atau toko Anda menjadi Mitra UMKM Ecolution.
              </p>
              <Link
                href="/merchant/register"
                className="block w-full text-center rounded-md bg-moss-700 py-2.5 text-xs font-semibold text-paper-50 hover:bg-moss-900 transition shadow-sm"
              >
                Daftar Menjadi UMKM
              </Link>
            </div>
          )}

          {user.role === "USER" && merchant && merchant.status === "PENDING" && (
            <div className="rounded-lg border border-ochre-200 bg-ochre-50/40 p-6 space-y-4 shadow-xs">
              <h3 className="font-display text-lg font-bold text-ochre-800">Status Pendaftaran UMKM</h3>
              <div className="space-y-2 text-xs">
                <p className="text-ink-700">
                  Pendaftaran toko Anda sedang ditinjau oleh Administrator.
                </p>
                <div className="border-t border-ochre-200/50 pt-2 space-y-1">
                  <p className="font-semibold text-ink-900">Detail Usaha:</p>
                  <p><span className="text-ink-400">Nama Toko:</span> {merchant.businessName}</p>
                  <p><span className="text-ink-400">Status:</span> <span className="font-semibold text-ochre-700 uppercase">Menunggu Review</span></p>
                </div>
              </div>
            </div>
          )}

          {merchant && merchant.status === "APPROVED" && (
            <div className="rounded-lg border border-paper-200 bg-white p-6 space-y-4 shadow-xs">
              <h3 className="font-display text-lg font-bold text-moss-700 border-b border-paper-100 pb-2">Informasi Toko UMKM</h3>
              <div className="space-y-3 text-xs">
                {merchant.logoUrl && (
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-paper-100 bg-paper-50 flex items-center justify-center">
                    <img src={merchant.logoUrl} alt={merchant.businessName} className="h-full w-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-ink-900 text-sm">{merchant.businessName}</p>
                  <p className="text-ink-400 mt-0.5">{merchant.description || "Tidak ada deskripsi."}</p>
                </div>
                <div className="border-t border-paper-100 pt-2 space-y-1 text-ink-700">
                  <p><span className="text-ink-400">Alamat:</span> {merchant.address || "-"}</p>
                  <p><span className="text-ink-400">Telepon:</span> {merchant.phone || "-"}</p>
                  <p><span className="text-ink-400">Email:</span> {merchant.email || "-"}</p>
                  {merchant.website && (
                    <p>
                      <span className="text-ink-400">Website:</span>{" "}
                      <a href={merchant.website} target="_blank" rel="noopener noreferrer" className="text-moss-700 hover:underline">
                        Kunjungi Situs &rarr;
                      </a>
                    </p>
                  )}
                </div>
                <Link
                  href="/dashboard"
                  className="block w-full text-center rounded-md bg-moss-700 py-2.5 text-xs font-semibold text-paper-50 hover:bg-moss-900 transition shadow-sm"
                >
                  Buka Seller Dashboard
                </Link>
              </div>
            </div>
          )}

          {merchant && merchant.status === "SUSPENDED" && (
            <div className="rounded-lg border border-rust-200 bg-rust-50/10 p-6 space-y-4 shadow-xs">
              <h3 className="font-display text-lg font-bold text-rust-600">Pendaftaran Toko Ditolak</h3>
              <p className="text-xs text-ink-700 leading-relaxed">
                Maaf, pendaftaran toko Anda ditangguhkan atau ditolak oleh administrator. Hubungi tim dukungan Ecolution untuk informasi lebih lanjut.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
