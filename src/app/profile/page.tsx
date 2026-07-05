"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api-client";

export default function ProfilePage() {
  const { user, setUser, isLoading } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  
  // Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Auto-clear toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      setLoadingMetrics(true);
      apiFetch<any>("/api/dashboard/user")
        .then((res) => {
          setMetrics(res.data);
        })
        .catch((err) => {
          console.error("Failed to load user metrics", err);
        })
        .finally(() => {
          setLoadingMetrics(false);
        });
    }
  }, [user]);

  // Open modal & fill initial data
  const handleOpenEditModal = () => {
    if (!user) return;
    setName(user.name || "");
    setUsername(user.username || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setAddress(user.address || "");
    setBio(user.bio || "");
    setProfileImageUrl(user.profileImageUrl || "");
    setPreviewUrl(user.profileImageUrl || "");
    setErrorMsg(null);
    setIsEditModalOpen(true);
  };

  const handleProfileImageChange = (val: string) => {
    setProfileImageUrl(val);
    setPreviewUrl(val);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Frontend Validations
    if (!name.trim()) {
      setErrorMsg("Nama lengkap tidak boleh kosong");
      return;
    }
    if (!username.trim()) {
      setErrorMsg("Username tidak boleh kosong");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Email tidak boleh kosong");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Format email tidak valid");
      return;
    }
    if (phone.trim() !== "") {
      const phoneRegex = /^[0-9+\-\s]{8,20}$/;
      if (!phoneRegex.test(phone)) {
        setErrorMsg("Format nomor telepon tidak valid");
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await apiFetch<any>("/api/auth/me", {
        method: "PUT",
        body: {
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          profileImageUrl: profileImageUrl.trim() || null,
          bio: bio.trim() || null,
          address: address.trim() || null,
        },
      });

      // Update global context user state
      setUser(res.data);
      setIsEditModalOpen(false);
      setToast({ message: "Profil berhasil diperbarui!", type: "success" });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Gagal memperbarui profil.");
      setToast({ message: err.message || "Gagal memperbarui profil.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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

  const dateJoined = new Date(user.createdAt).toLocaleDateString("id-ID", {
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
        return "bg-rust-100 border-rust-300 text-rust-700";
      case "UMKM":
        return "bg-ochre-100 border-ochre-300 text-ochre-700";
      default:
        return "bg-moss-100 border-moss-300 text-moss-700";
    }
  };

  const actCount = metrics?.activitiesCount || { TOTAL: 0, APPROVED: 0, PENDING: 0, REJECTED: 0 };

  return (
    <div className="space-y-8 font-body">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 rounded-lg border p-4 shadow-lg flex items-center gap-3 transition-all duration-300 animate-slide-up ${
          toast.type === "success" ? "bg-moss-50 border-moss-200 text-moss-800" : "bg-rust-50 border-rust-200 text-rust-850"
        }`}>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header Profile Section */}
      <div className="rounded-lg border border-paper-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row gap-6 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-5 items-center text-center sm:text-left">
          <div className="h-20 w-20 rounded-full border border-paper-200 overflow-hidden bg-paper-50 flex items-center justify-center font-display font-bold text-moss-700 text-3xl uppercase">
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold text-ink-900">{user.name}</h1>
            <p className="text-sm text-ink-400 font-mono">@{user.username}</p>
            <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
              <span className={`inline-block border text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded ${getRoleBadgeClass(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
              <span className="text-xs text-ink-450 font-mono">Bergabung {dateJoined}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleOpenEditModal}
          className="rounded-md bg-moss-700 px-5 py-2 text-xs font-semibold text-paper-50 hover:bg-moss-900 transition shadow-sm self-center sm:self-start"
        >
          Edit Profil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Informasi Akun */}
        <div className="rounded-lg border border-paper-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-paper-100 pb-2">
            Informasi Akun
          </h2>
          <div className="space-y-3 text-sm text-ink-700">
            <div className="grid grid-cols-3">
              <span className="text-ink-400 font-medium">Bio</span>
              <span className="col-span-2 italic text-ink-600">{user.bio || "Belum ada bio."}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-ink-400 font-medium">Email</span>
              <span className="col-span-2 font-mono break-all">{user.email}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-ink-400 font-medium">No. Telepon</span>
              <span className="col-span-2 font-mono">{user.phone || "-"}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-ink-400 font-medium">Alamat</span>
              <span className="col-span-2 leading-relaxed">{user.address || "-"}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Statistik Kontribusi & Poin */}
        <div className="rounded-lg border border-paper-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-paper-100 pb-2">
            Statistik Kontribusi & Reward
          </h2>
          {loadingMetrics ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-6 bg-paper-50 rounded" />
              <div className="h-6 bg-paper-50 rounded" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-moss-50 border border-moss-200 rounded-md">
                <p className="font-mono text-[10px] uppercase text-moss-700 font-bold">Total Poin</p>
                <p className="mt-1 font-display text-xl font-bold text-moss-700">{user.totalPoint} Pts</p>
              </div>
              <div className="p-3 bg-ochre-50/20 border border-ochre-200 rounded-md">
                <p className="font-mono text-[10px] uppercase text-ochre-700 font-bold">Trust Score</p>
                <p className="mt-1 font-display text-xl font-bold text-ochre-600">{user.trustScore}%</p>
              </div>
              <div className="p-3 bg-paper-50 border border-paper-100 rounded-md">
                <p className="font-mono text-[10px] uppercase text-ink-400 font-bold">Aksi Hijau (Total)</p>
                <p className="mt-1 font-display text-lg font-bold text-ink-900">{actCount.TOTAL}</p>
              </div>
              <div className="p-3 bg-paper-50 border border-paper-100 rounded-md">
                <p className="font-mono text-[10px] uppercase text-ink-400 font-bold">Disetujui</p>
                <p className="mt-1 font-display text-lg font-bold text-moss-700">{actCount.APPROVED}</p>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Keamanan Akun */}
        <div className="rounded-lg border border-paper-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="font-display text-lg font-bold text-ink-900 border-b border-paper-100 pb-2">
            Keamanan Akun
          </h2>
          <div className="space-y-3.5 text-sm text-ink-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-ink-900">Kata Sandi</p>
                <p className="text-xs text-ink-400 mt-0.5">Terakhir diperbarui beberapa saat yang lalu</p>
              </div>
              <span className="font-mono text-xs font-semibold bg-paper-100 text-ink-650 px-2 py-0.5 rounded">Aktif</span>
            </div>
            <div className="flex justify-between items-center border-t border-paper-100 pt-3">
              <div>
                <p className="font-medium text-ink-900">Autentikasi Dua Faktor (2FA)</p>
                <p className="text-xs text-ink-400 mt-0.5">Amankan akun Anda dengan verifikasi OTP</p>
              </div>
              <span className="font-mono text-xs font-semibold bg-rust-50 text-rust-600 px-2 py-0.5 rounded">Nonaktif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-lg border border-paper-200 bg-white p-6 shadow-xl space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg font-bold text-ink-900 border-b border-paper-100 pb-2">
              Edit Profil Saya
            </h3>

            {errorMsg && (
              <div className="rounded-md border border-rust-500/30 bg-rust-500/5 px-3 py-2 text-xs text-rust-600">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Image Preview & URL input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Foto Profil
                </label>
                <div className="flex gap-4 items-center">
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-paper-200 bg-paper-50 flex items-center justify-center text-moss-700 font-bold text-2xl uppercase">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      name.charAt(0) || "U"
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Tautan Gambar Foto Profil (https://...)"
                    value={profileImageUrl}
                    onChange={(e) => handleProfileImageChange(e.target.value)}
                    className="flex-1 rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                  />
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label htmlFor="editName" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Nama Lengkap <span className="text-rust-500">*</span>
                </label>
                <input
                  id="editName"
                  type="text"
                  required
                  placeholder="Nama Lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label htmlFor="editUsername" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Username <span className="text-rust-500">*</span>
                </label>
                <input
                  id="editUsername"
                  type="text"
                  required
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 font-mono text-xs"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="editEmail" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Email <span className="text-rust-500">*</span>
                </label>
                <input
                  id="editEmail"
                  type="email"
                  required
                  placeholder="kamu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 font-mono text-xs"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor="editPhone" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Nomor Telepon
                </label>
                <input
                  id="editPhone"
                  type="text"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 font-mono text-xs"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label htmlFor="editBio" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Bio Singkat
                </label>
                <input
                  id="editBio"
                  type="text"
                  placeholder="Saya menyukai alam dan menjaga lingkungan..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label htmlFor="editAddress" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Alamat
                </label>
                <textarea
                  id="editAddress"
                  rows={2}
                  placeholder="Jl. Raya No. 12, Kota"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-paper-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 rounded-md border border-paper-200 bg-white py-2.5 text-xs font-semibold text-ink-700 hover:bg-paper-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-md bg-moss-700 py-2.5 text-xs font-semibold text-paper-50 hover:bg-moss-900 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
