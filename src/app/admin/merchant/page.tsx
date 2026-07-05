"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { useConfirm } from "@/providers/confirm-provider";

export default function AdminMerchantApprovalPage() {
  const confirm = useConfirm();
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    fetchMerchants();
  }, []);

  function fetchMerchants() {
    setLoading(true);
    apiFetch<any>("/api/merchant")
      .then((res) => {
        setMerchants(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load merchants", err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function handleApprove(id: string) {
    if (!(await confirm("Apakah Anda yakin ingin menyetujui pendaftaran UMKM ini?"))) return;
    setActionId(id);
    try {
      await apiFetch(`/api/merchant/${id}/approve`, { method: "POST" });
      const updated = merchants.map((m) => {
        if (m.id === id) {
          return { ...m, status: "APPROVED", isApproved: true };
        }
        return m;
      });
      setMerchants(updated);
      toast.success("Pendaftaran UMKM disetujui.");
    } catch (err) {
      console.error("Approve failed", err);
      toast.error("Gagal menyetujui pendaftaran.");
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: string) {
    if (!(await confirm("Apakah Anda yakin ingin menolak pendaftaran UMKM ini?"))) return;
    setActionId(id);
    try {
      await apiFetch(`/api/merchant/${id}/reject`, { method: "POST" });
      const updated = merchants.map((m) => {
        if (m.id === id) {
          return { ...m, status: "SUSPENDED" };
        }
        return m;
      });
      setMerchants(updated);
      toast.success("Pendaftaran UMKM ditolak.");
    } catch (err) {
      console.error("Reject failed", err);
      toast.error("Gagal menolak pendaftaran.");
    } finally {
      setActionId(null);
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Disetujui";
      case "SUSPENDED":
        return "Ditolak";
      default:
        return "Menunggu Persetujuan";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-moss-750 text-paper-50 border-moss-700";
      case "SUSPENDED":
        return "bg-rust-50/10 text-rust-600 border-rust-200";
      default:
        return "bg-ochre-50/20 text-ochre-700 border-ochre-200";
    }
  };

  return (
    <div className="space-y-6 font-body">
      <div>
        <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
          Persetujuan Pendaftaran UMKM
        </h1>
        <p className="font-body text-sm text-ink-400 mt-1">
          Tinjau pendaftaran toko baru dari pengguna dan berikan akses role UMKM jika disetujui.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-4 text-center text-sm text-rust-600">
          Gagal memuat pendaftaran UMKM. Silakan coba lagi.
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-paper-200 bg-white p-5 h-28" />
          ))}
        </div>
      ) : merchants.length === 0 ? (
        <div className="rounded-lg border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400 max-w-lg mx-auto">
          <h3 className="text-base font-semibold text-ink-900">Tidak Ada Pendaftaran</h3>
          <p className="mt-1 text-sm text-ink-400">Belum ada pengajuan pendaftaran UMKM saat ini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {merchants.map((merchant) => (
            <div
              key={merchant.id}
              className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-ink-900 leading-tight">
                    {merchant.businessName}
                  </h3>
                  <span className={`inline-block rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeClass(merchant.status)}`}>
                    {getStatusLabel(merchant.status)}
                  </span>
                </div>

                <div className="text-xs text-ink-700 space-y-0.5">
                  <p><span className="text-ink-400">Pendaftar:</span> {merchant.owner?.name} (@{merchant.owner?.username})</p>
                  <p><span className="text-ink-400">Email Pemilik:</span> {merchant.owner?.email}</p>
                  <p><span className="text-ink-400">No Telepon:</span> {merchant.phone || "-"}</p>
                  {merchant.address && <p><span className="text-ink-400">Alamat:</span> {merchant.address}</p>}
                  {merchant.description && <p className="italic text-ink-500 mt-1">"{merchant.description}"</p>}
                </div>
              </div>

              {merchant.status === "PENDING" && (
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto border-t border-paper-100 md:border-0 pt-3 md:pt-0">
                  <button
                    disabled={actionId === merchant.id}
                    onClick={() => handleReject(merchant.id)}
                    className="flex-1 md:flex-none rounded border border-rust-200 bg-rust-50/10 px-4 py-2 text-xs font-semibold text-rust-600 hover:bg-rust-50 transition"
                  >
                    Tolak
                  </button>
                  <button
                    disabled={actionId === merchant.id}
                    onClick={() => handleApprove(merchant.id)}
                    className="flex-1 md:flex-none rounded bg-moss-700 px-4 py-2 text-xs font-semibold text-paper-50 hover:bg-moss-900 transition"
                  >
                    Setujui
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
