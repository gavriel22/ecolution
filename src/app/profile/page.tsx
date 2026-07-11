"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api-client";
import { Avatar } from "@/components/ui/avatar";

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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
    setAvatarFile(null);
    setErrorMsg(null);
    setIsEditModalOpen(true);
  };

  const handleAvatarSelect = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("File harus berupa gambar (JPG, PNG, WEBP, atau GIF).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran foto maksimum 5 MB.");
      return;
    }

    setErrorMsg(null);
    setAvatarFile(file);
    // Revoke the previous object URL (if any) before creating a new one.
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAvatarRemove = () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setAvatarFile(null);
    setProfileImageUrl("");
    setPreviewUrl("");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
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
      // If the user picked a new photo, upload it first and use the returned URL.
      let finalImageUrl: string | null = profileImageUrl.trim() || null;
      if (avatarFile) {
        const form = new FormData();
        form.append("image", avatarFile);
        const uploadRes = await apiFetch<{ url: string }>("/api/auth/avatar", {
          method: "POST",
          body: form,
        });
        finalImageUrl = uploadRes.data.url;
      }

      const res = await apiFetch<any>("/api/auth/me", {
        method: "PUT",
        body: {
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          profileImageUrl: finalImageUrl,
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
        return "Pengguna";
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
      <div className="rounded-2xl border border-paper-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row gap-6 items-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-ochre-400/20 scale-110"></div>
          <Avatar
            name={user.name}
            src={user.profileImageUrl}
            className="relative h-24 w-24 text-3xl shadow-sm border border-paper-200"
          />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="font-display text-xl font-bold text-moss-800">{user.name}</h1>
          <p className="text-sm font-medium text-ink-600">{getRoleLabel(user.role)}</p>
          <p className="text-sm text-ink-500">{user.address || "Belum ada alamat"}</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-2xl border border-paper-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-paper-100 pb-4 mb-6">
          <h2 className="font-display text-lg font-bold text-moss-800">
            Personal Information
          </h2>
          <button
            onClick={handleOpenEditModal}
            className="flex items-center gap-2 rounded-md bg-ochre-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-ochre-600 transition shadow-sm"
          >
            Edit <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-4 text-sm">
          <div>
            <p className="text-ink-400 font-medium mb-1 text-xs">Nama Lengkap</p>
            <p className="font-semibold text-ink-900">{user.name}</p>
          </div>
          <div>
            <p className="text-ink-400 font-medium mb-1 text-xs">Username</p>
            <p className="font-semibold text-ink-900">@{user.username}</p>
          </div>
          <div>
            <p className="text-ink-400 font-medium mb-1 text-xs">Bio</p>
            <p className="font-semibold text-ink-900">{user.bio || "-"}</p>
          </div>
          <div>
            <p className="text-ink-400 font-medium mb-1 text-xs">Email Address</p>
            <p className="font-semibold text-ink-900 break-all">{user.email}</p>
          </div>
          <div>
            <p className="text-ink-400 font-medium mb-1 text-xs">Phone Number</p>
            <p className="font-semibold text-ink-900">{user.phone || "-"}</p>
          </div>
          <div>
            <p className="text-ink-400 font-medium mb-1 text-xs">Peran Pengguna</p>
            <p className="font-semibold text-ink-900">{getRoleLabel(user.role)}</p>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="rounded-2xl border border-paper-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-paper-100 pb-4 mb-6">
          <h2 className="font-display text-lg font-bold text-moss-800">
            Address
          </h2>
          <button
            onClick={handleOpenEditModal}
            className="flex items-center gap-2 rounded-md border border-paper-200 px-4 py-1.5 text-xs font-semibold text-ink-600 hover:bg-paper-50 transition shadow-sm"
          >
            Edit <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
        </div>
        <div className="text-sm">
            <p className="text-ink-400 font-medium mb-1 text-xs">Alamat Lengkap</p>
            <p className="font-semibold text-ink-900 leading-relaxed">{user.address || "Belum ada alamat."}</p>
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
              {/* Profile Image Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Foto Profil
                </label>
                <div className="flex flex-wrap gap-4 items-center">
                  <Avatar name={name} src={previewUrl} className="h-16 w-16 text-2xl border border-paper-200" />
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="rounded-md border border-paper-200 bg-white px-3 py-2 text-sm font-semibold text-moss-700 transition hover:bg-moss-50"
                      >
                        {previewUrl ? "Ganti Foto" : "Unggah Foto"}
                      </button>
                      {previewUrl && (
                        <button
                          type="button"
                          onClick={handleAvatarRemove}
                          className="rounded-md border border-paper-200 bg-white px-3 py-2 text-sm font-medium text-rust-600 transition hover:bg-rust-50"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-ink-400">JPG, PNG, WEBP, atau GIF · maks. 5MB</p>
                  </div>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    handleAvatarSelect(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
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
