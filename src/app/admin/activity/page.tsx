"use client";

import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listActivities, approveActivity, rejectActivity } from "@/features/activity/api";
import { ApiError } from "@/lib/api-client";
import type { ActivityStatus } from "@/features/activity/types";
import { toast } from "sonner";

export default function AdminActivityPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ActivityStatus>("PENDING");
  const [page, setPage] = useState(1);

  // Modal State
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyType, setVerifyType] = useState<"approve" | "reject" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch activities
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-activities", status, page],
    queryFn: async () => {
      const res = await listActivities({ status, page, limit: 10 });
      return { activities: res.data, meta: res.meta };
    },
  });

  const activities = data?.activities || [];
  const meta = data?.meta;

  // Mutations
  const approveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => approveActivity(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-activities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      setVerifyingId(null);
      setVerifyType(null);
      setActionNote("");
      toast.success("Aktivitas berhasil disetujui!");
    },
    onError: (err) => {
      setErrorMsg(err instanceof ApiError ? err.message : "Gagal menyetujui aktivitas.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, adminNote, note }: { id: string; adminNote: string; note?: string }) =>
      rejectActivity(id, adminNote, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-activities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      setVerifyingId(null);
      setVerifyType(null);
      setAdminNote("");
      setActionNote("");
      toast.success("Aktivitas berhasil ditolak.");
    },
    onError: (err) => {
      setErrorMsg(err instanceof ApiError ? err.message : "Gagal menolak aktivitas.");
    },
  });

  const openVerificationModal = (id: string, type: "approve" | "reject") => {
    setVerifyingId(id);
    setVerifyType(type);
    setAdminNote("");
    setActionNote("");
    setErrorMsg(null);
  };

  const handleVerifySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!verifyingId) return;

    if (verifyType === "approve") {
      approveMutation.mutate({
        id: verifyingId,
        note: actionNote.trim() || undefined,
      });
    } else if (verifyType === "reject") {
      if (!adminNote.trim()) {
        setErrorMsg("Alasan penolakan wajib diisi");
        return;
      }
      rejectMutation.mutate({
        id: verifyingId,
        adminNote: adminNote.trim(),
        note: actionNote.trim() || undefined,
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isProcessing = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
          Verifikasi Aktivitas
        </h1>
        <p className="text-sm text-ink-400 mt-1">
          Tinjau pelaporan aksi hijau dari pengguna. Setujui untuk mengalokasikan poin reward atau tolak jika tidak valid.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-paper-200 gap-6 text-sm font-semibold">
        {(["PENDING", "APPROVED", "REJECTED"] as ActivityStatus[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setStatus(tab);
              setPage(1);
            }}
            className={`pb-2 border-b-2 transition ${
              status === tab
                ? "border-moss-700 text-moss-700"
                : "border-transparent text-ink-400 hover:text-ink-900"
            }`}
          >
            {tab === "PENDING"
              ? "Perlu Verifikasi"
              : tab === "APPROVED"
              ? "Disetujui"
              : "Ditolak"}
          </button>
        ))}
      </div>

      {isError && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-4 text-center text-sm text-rust-600">
          Gagal memuat aktivitas. Silakan coba lagi.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-paper-100 border border-paper-200 rounded-lg" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-lg border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400">
          <svg className="mx-auto h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 00-2 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="mt-3 text-base font-semibold text-ink-900">Tidak Ada Laporan</h3>
          <p className="mt-1 text-sm">Tidak ada aktivitas dengan status ini.</p>
        </div>
      ) : (
        /* List */
        <div className="space-y-4">
          {activities.map((act: any) => (
            <div
              key={act.id}
              className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs flex flex-col md:flex-row gap-5"
            >
              {/* Photo */}
              <div className="h-36 w-full md:w-44 shrink-0 overflow-hidden rounded bg-paper-50 flex items-center justify-center border border-paper-100">
                {act.imageUrl ? (
                  <img loading="lazy" decoding="async" src={act.imageUrl} alt={act.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] text-ink-300 uppercase tracking-wider font-mono">No Image</span>
                )}
              </div>

              {/* Specs */}
              <div className="flex-1 min-w-0 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-100 pb-1.5">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-ink-900">{act.user?.name || "Pengguna"}</p>
                    <p className="text-[10px] font-mono text-ink-400">Tanggal: {formatDate(act.activityDate)}</p>
                  </div>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider bg-moss-50 border border-moss-200 text-moss-700 px-2 py-0.5 rounded">
                    {act.category?.name || "Kategori"}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-ink-900 truncate leading-snug">{act.title}</h3>
                  <p className="text-xs text-ink-400 leading-normal line-clamp-2">{act.description || "Tidak ada deskripsi."}</p>
                </div>

                {/* Verification results */}
                {act.verification && (
                  <div className="text-[10px] bg-paper-50 p-2.5 rounded border border-paper-100 font-mono space-y-1">
                    <p className="font-bold text-ink-700">Analisis AI:</p>
                    <p className="text-ink-400 leading-normal">
                      Metode: {act.verification.method} · Confidence: {act.verification.confidence}%
                    </p>
                    <p className="text-ink-400 leading-normal">Keterangan: {act.verification.note}</p>
                  </div>
                )}

                {/* Action buttons (only for PENDING status) */}
                {status === "PENDING" && (
                  <div className="flex gap-2 pt-2 justify-end">
                    <button
                      onClick={() => openVerificationModal(act.id, "reject")}
                      className="rounded-md border border-rust-200 bg-white px-4 py-1.5 text-xs font-semibold text-rust-600 hover:bg-rust-50 transition"
                    >
                      Tolak Aksi
                    </button>
                    <button
                      onClick={() => openVerificationModal(act.id, "approve")}
                      className="rounded-md bg-moss-700 px-4 py-1.5 text-xs font-semibold text-paper-50 hover:bg-moss-900 transition"
                    >
                      Setujui Aksi
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-paper-200 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex h-9 items-center justify-center rounded-md border border-paper-200 bg-white px-4 text-sm font-medium text-ink-700 hover:bg-paper-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            ← Sebelumnya
          </button>
          <span className="font-mono text-xs text-ink-400">
            Halaman {meta.page} dari {meta.totalPages}
          </span>
          <button
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex h-9 items-center justify-center rounded-md border border-paper-200 bg-white px-4 text-sm font-medium text-ink-700 hover:bg-paper-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Selanjutnya →
          </button>
        </div>
      )}

      {/* Verification Modal Dialog */}
      {verifyingId && verifyType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-lg border border-paper-200 bg-white p-6 shadow-xl space-y-4 animate-scale-in">
            <h3 className="font-display text-lg font-bold text-ink-900 border-b border-paper-100 pb-2">
              {verifyType === "approve" ? "Setujui Aktivitas" : "Tolak Aktivitas"}
            </h3>

            {errorMsg && (
              <div className="rounded-md border border-rust-500/30 bg-rust-500/5 px-3 py-2 text-xs text-rust-600">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              {verifyType === "reject" && (
                <div className="space-y-1.5">
                  <label htmlFor="rejectReason" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                    Alasan Penolakan <span className="text-rust-500">*</span>
                  </label>
                  <textarea
                    id="rejectReason"
                    required
                    rows={3}
                    placeholder="Contoh: Foto tidak jelas atau GPS tidak sinkron"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="adminComment" className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Catatan Verifikator <span className="normal-case text-ink-400/70">(opsional)</span>
                </label>
                <input
                  id="adminComment"
                  type="text"
                  placeholder="Tambahkan catatan singkat"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-paper-100">
                <button
                  type="button"
                  onClick={() => setVerifyingId(null)}
                  className="flex-1 rounded-md border border-paper-200 bg-white py-2 text-xs font-semibold text-ink-700 hover:bg-paper-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`flex-1 rounded-md py-2 text-xs font-semibold text-paper-50 transition ${
                    verifyType === "approve"
                      ? "bg-moss-700 hover:bg-moss-900"
                      : "bg-rust-600 hover:bg-rust-700"
                  }`}
                >
                  {isProcessing ? "Menyimpan..." : "Kirim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
