"use client";

import { useAuth } from "@/context/auth-context";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="font-body text-sm text-ink-400">Memuat profil...</p>;
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
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
          Profil Saya
        </h1>
        <p className="font-body text-sm text-ink-400 mt-1">
          Kelola informasi akun Anda dan pantau reputasi kontribusi Anda.
        </p>
      </div>

      <div className="max-w-2xl overflow-hidden rounded-lg border border-paper-200 bg-white shadow-xs">
        {/* Profile Card Header */}
        <div className="bg-moss-900 px-6 py-8 text-paper-50 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper-100 text-moss-900 font-display font-semibold text-3xl uppercase">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1.5">
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
        <div className="p-6 divide-y divide-paper-100 font-body">
          <div className="flex justify-between py-4">
            <span className="text-sm font-semibold text-ink-400">Username</span>
            <span className="font-mono text-sm text-ink-900">@{user.username}</span>
          </div>
          <div className="flex justify-between py-4">
            <span className="text-sm font-semibold text-ink-400">Email</span>
            <span className="text-sm text-ink-900">{user.email}</span>
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
  );
}
