"use client";

import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { useConfirm } from "@/providers/confirm-provider";

// Form local helper
function toLocalDateTimeInput(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default function AdminChallengePage() {
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  // Fetch Challenges
  const { data: challenges = [], isLoading: isLoadingList } = useQuery({
    queryKey: ["admin-challenges-list"],
    queryFn: async () => {
      const res = await apiFetch<any[]>("/api/challenge");
      return res.data;
    },
  });

  // Fetch Categories
  const { data: categories = [], isLoading: isLoadingCats } = useQuery({
    queryKey: ["challenge-categories"],
    queryFn: async () => {
      const res = await apiFetch<any[]>("/api/challenge/categories");
      return res.data;
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (body: any) =>
      apiFetch<any>("/api/challenge", {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-challenges-list"] });
      setIsModalOpen(false);
      toast.success("Tantangan berhasil dibuat!");
    },
    onError: (err) => {
      setErrorMsg(err instanceof ApiError ? err.message : "Gagal membuat tantangan.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      apiFetch<any>(`/api/challenge/${id}`, {
        method: "PUT",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-challenges-list"] });
      setIsModalOpen(false);
      toast.success("Tantangan berhasil diperbarui!");
    },
    onError: (err) => {
      setErrorMsg(err instanceof ApiError ? err.message : "Gagal memperbarui tantangan.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<any>(`/api/challenge/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-challenges-list"] });
      toast.success("Tantangan berhasil dihapus!");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Gagal menghapus tantangan.");
    },
  });

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("DAILY");
  const [target, setTarget] = useState(1);
  const [pointReward, setPointReward] = useState(50);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const openAddModal = () => {
    setEditingChallenge(null);
    setTitle("");
    setDescription("");
    setType("DAILY");
    setTarget(1);
    setPointReward(50);
    setStartDate(toLocalDateTimeInput(new Date().toISOString()));
    setEndDate(toLocalDateTimeInput(new Date(Date.now() + 7 * 86400000).toISOString()));
    setStatus("DRAFT");
    setImageUrl("");
    setCategoryId(categories[0]?.id || "");
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (chal: any) => {
    setEditingChallenge(chal);
    setTitle(chal.title);
    setDescription(chal.description || "");
    setType(chal.type);
    setTarget(chal.target);
    setPointReward(chal.pointReward);
    setStartDate(toLocalDateTimeInput(chal.startDate));
    setEndDate(toLocalDateTimeInput(chal.endDate));
    setStatus(chal.status);
    setImageUrl(chal.imageUrl || "");
    setCategoryId(chal.categoryId || "");
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (await confirm("Apakah Anda yakin ingin menghapus tantangan ini? Seluruh partisipasi dan progres user terkait akan ikut terhapus.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (title.trim().length < 3) {
      setErrorMsg("Judul tantangan minimal 3 karakter");
      return;
    }
    if (target < 1) {
      setErrorMsg("Target minimal 1 aksi");
      return;
    }
    if (pointReward <= 0) {
      setErrorMsg("Poin reward harus lebih besar dari 0");
      return;
    }
    if (!startDate || !endDate) {
      setErrorMsg("Tanggal mulai dan berakhir wajib ditentukan");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setErrorMsg("Tanggal mulai harus lebih awal dari tanggal berakhir");
      return;
    }
    if (!categoryId) {
      setErrorMsg("Kategori tantangan wajib dipilih");
      return;
    }

    const payload = {
      categoryId,
      title: title.trim(),
      description: description.trim() || null,
      type,
      target,
      pointReward,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status,
      imageUrl: imageUrl.trim() || null,
    };

    if (editingChallenge) {
      updateMutation.mutate({ id: editingChallenge.id, body: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
            Kelola Challenge
          </h1>
          <p className="text-sm text-ink-400 mt-1">
            Buat, perbarui, dan hapus kampanye tantangan aksi hijau bagi para pengguna platform.
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={categories.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-moss-700 px-4 py-2 text-sm font-medium text-paper-50 transition-all hover:bg-moss-900 shadow-sm self-start sm:self-auto disabled:opacity-45"
        >
          + Tambah Challenge
        </button>
      </div>

      {isLoadingList || isLoadingCats ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 rounded bg-paper-100" />
          <div className="h-32 rounded bg-paper-100" />
        </div>
      ) : challenges.length === 0 ? (
        <div className="rounded-lg border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400">
          <svg className="mx-auto h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-3 text-base font-semibold text-ink-900">Belum Ada Challenge</h3>
          <p className="mt-1 text-sm">Tekan tombol di atas untuk membuat tantangan pertama Anda.</p>
        </div>
      ) : (
        /* Inventory Table */
        <div className="rounded-lg border border-paper-200 bg-white shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-paper-100 bg-paper-50/50 font-mono text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
                <th className="px-5 py-3">Tantangan</th>
                <th className="px-5 py-3">Tipe</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">Reward</th>
                <th className="px-5 py-3">Timeline</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-100 text-sm text-ink-700">
              {challenges.map((chal) => (
                <tr key={chal.id} className="hover:bg-paper-50/40">
                  <td className="px-5 py-3 font-semibold text-ink-900 max-w-[200px] truncate" title={chal.title}>
                    {chal.title}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">
                    {chal.type}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">
                    {chal.target} Aksi
                  </td>
                  <td className="px-5 py-3 font-mono text-moss-700 font-semibold">
                    +{chal.pointReward} Pts
                  </td>
                  <td className="px-5 py-3 text-xs text-ink-400 font-mono">
                    {formatDate(chal.startDate)} - {formatDate(chal.endDate)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block rounded-xs px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider border ${
                      chal.status === "ACTIVE"
                        ? "bg-moss-50 border-moss-200 text-moss-700"
                        : chal.status === "DRAFT"
                        ? "bg-paper-100 border-paper-250 text-ink-400"
                        : "bg-rust-50 border-rust-200 text-rust-600"
                    }`}>
                      {chal.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(chal)}
                      className="rounded-md border border-paper-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-paper-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(chal.id)}
                      className="rounded-md border border-rust-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rust-600 hover:bg-rust-50 transition"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Challenge Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-lg border border-paper-200 bg-white p-6 shadow-xl space-y-4 animate-scale-in my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-paper-100 pb-3">
              <h3 className="font-display text-lg font-bold text-ink-900">
                {editingChallenge ? "Edit Informasi Tantangan" : "Buat Tantangan Baru"}
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

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Title */}
              <div className="space-y-1">
                <label htmlFor="chalTitle" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Judul Tantangan</label>
                <input
                  id="chalTitle"
                  required
                  type="text"
                  placeholder="Contoh: Tantangan 5 Hari Bersih Pantai"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                />
              </div>

              {/* Category & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="chalCat" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Kategori Tantangan</label>
                  <select
                    id="chalCat"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                  >
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="chalType" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Tipe Challenge</label>
                  <select
                    id="chalType"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                  >
                    <option value="DAILY">Harian (DAILY)</option>
                    <option value="WEEKLY">Mingguan (WEEKLY)</option>
                    <option value="MONTHLY">Bulanan (MONTHLY)</option>
                    <option value="EVENT">Kampanye Khusus (EVENT)</option>
                  </select>
                </div>
              </div>

              {/* Target & Point Reward */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="chalTarget" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Target Aksi</label>
                  <input
                    id="chalTarget"
                    required
                    type="number"
                    min="1"
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="chalReward" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Point Reward</label>
                  <input
                    id="chalReward"
                    required
                    type="number"
                    min="1"
                    value={pointReward}
                    onChange={(e) => setPointReward(Number(e.target.value))}
                    className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="chalStart" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Mulai</label>
                  <input
                    id="chalStart"
                    required
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="chalEnd" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Berakhir</label>
                  <input
                    id="chalEnd"
                    required
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                  />
                </div>
              </div>

              {/* Status & Banner Image URL */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="chalStatus" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Status</label>
                  <select
                    id="chalStatus"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                  >
                    <option value="DRAFT">DRAFT / Konsep</option>
                    <option value="ACTIVE">ACTIVE / Buka</option>
                    <option value="COMPLETED">COMPLETED / Tutup</option>
                    <option value="ARCHIVED">ARCHIVED / Arsip</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="chalImg" className="text-xs font-semibold uppercase tracking-wider text-ink-400">URL Foto Banner</label>
                  <input
                    id="chalImg"
                    type="url"
                    placeholder="https://example.com/banner.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label htmlFor="chalDesc" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Deskripsi Aturan</label>
                <textarea
                  id="chalDesc"
                  rows={3}
                  placeholder="Terangkan aturan main, tipe sampah yang diperbolehkan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
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
                  disabled={isSaving}
                  className="flex-1 rounded-md bg-moss-700 py-2 text-sm font-semibold text-paper-50 hover:bg-moss-900 transition disabled:opacity-50"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Challenge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
