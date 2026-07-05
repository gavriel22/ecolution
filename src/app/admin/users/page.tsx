"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

export default function AdminUsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  function fetchUsers() {
    setLoading(true);
    apiFetch<any>("/api/users")
      .then((res) => {
        setUsers(res.data.users || []);
      })
      .catch((err) => {
        console.error("Failed to load users", err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdatingId(userId);
    try {
      await apiFetch(`/api/users/${userId}`, {
        method: "PUT",
        body: { role: newRole },
      });
      const updated = users.map((u) => {
        if (u.id === userId) {
          return { ...u, role: newRole };
        }
        return u;
      });
      setUsers(updated);
    } catch (err) {
      console.error("Failed to update role", err);
      toast.error("Gagal mengubah role pengguna.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleToggleActive(userId: string, currentActive: boolean) {
    setUpdatingId(userId);
    const nextActive = !currentActive;
    try {
      await apiFetch(`/api/users/${userId}`, {
        method: "PUT",
        body: { isActive: nextActive },
      });
      const updated = users.map((u) => {
        if (u.id === userId) {
          return { ...u, isActive: nextActive };
        }
        return u;
      });
      setUsers(updated);
    } catch (err) {
      console.error("Failed to toggle active state", err);
      toast.error("Gagal memperbarui status aktif pengguna.");
    } finally {
      setUpdatingId(null);
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Admin";
      case "UMKM":
        return "UMKM";
      default:
        return "User";
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
    <div className="space-y-6 font-body">
      <div>
        <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
          Kelola Pengguna
        </h1>
        <p className="font-body text-sm text-ink-400 mt-1">
          Pantau daftar pengguna platform, sesuaikan role akses, dan kelola status aktif/blokir.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-4 text-center text-sm text-rust-600">
          Gagal memuat daftar pengguna. Silakan coba lagi.
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-paper-200 bg-white p-5 h-20" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-paper-200 bg-white overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-paper-100 bg-paper-50/50 text-[10px] font-mono uppercase tracking-wider text-ink-400 font-semibold">
                <th className="p-4">Nama / Username</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Poin / Trust</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-100 text-sm text-ink-700">
              {users.map((usr) => (
                <tr key={usr.id} className="hover:bg-paper-50/30">
                  <td className="p-4">
                    <p className="font-semibold text-ink-900 leading-tight">{usr.name}</p>
                    <p className="font-mono text-xs text-ink-400 mt-0.5">@{usr.username}</p>
                  </td>
                  <td className="p-4 font-mono text-xs">{usr.email}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block rounded-xs px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${getRoleBadgeClass(usr.role)}`}>
                        {getRoleLabel(usr.role)}
                      </span>
                      <select
                        disabled={updatingId === usr.id}
                        value={usr.role}
                        onChange={(e) => handleRoleChange(usr.id, e.target.value)}
                        className="rounded border border-paper-200 bg-white px-1.5 py-0.5 text-xs font-semibold text-ink-700 outline-none focus:border-moss-500"
                      >
                        <option value="USER">USER</option>
                        <option value="UMKM">UMKM</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs">
                    <p>{usr.totalPoint} pts</p>
                    <p className="text-ochre-600 mt-0.5">{usr.trustScore}% trust</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block rounded-full h-2 w-2 ${usr.isActive ? "bg-moss-500" : "bg-rust-500"}`} />
                    <span className="ml-1.5 text-xs font-medium text-ink-700">
                      {usr.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      disabled={updatingId === usr.id}
                      onClick={() => handleToggleActive(usr.id, usr.isActive)}
                      className={`rounded px-3 py-1 text-xs font-semibold border transition ${
                        usr.isActive
                          ? "border-rust-200 text-rust-600 hover:bg-rust-50"
                          : "border-moss-200 text-moss-700 hover:bg-moss-50"
                      }`}
                    >
                      {usr.isActive ? "Blokir" : "Aktifkan"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
