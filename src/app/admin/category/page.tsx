"use client";

import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { useConfirm } from "@/providers/confirm-provider";

export default function AdminCategoryPage() {
  const confirm = useConfirm();
  const queryClient = useQueryClient();

  // Fetch Categories
  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ["admin-activity-categories"],
    queryFn: async () => {
      const res = await apiFetch<any[]>("/api/activity/categories");
      return res.data;
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (body: any) =>
      apiFetch<any>("/api/activity/categories", {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-activity-categories"] });
      setIsModalOpen(false);
      toast.success("Kategori berhasil ditambahkan!");
    },
    onError: (err) => {
      setErrorMsg(err instanceof ApiError ? err.message : "Gagal menambahkan kategori.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      apiFetch<any>(`/api/activity/categories/${id}`, {
        method: "PUT",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-activity-categories"] });
      setIsModalOpen(false);
      toast.success("Kategori berhasil diperbarui!");
    },
    onError: (err) => {
      setErrorMsg(err instanceof ApiError ? err.message : "Gagal memperbarui kategori.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<any>(`/api/activity/categories/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-activity-categories"] });
      toast.success("Kategori berhasil dihapus!");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Gagal menghapus kategori.");
    },
  });

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pointReward, setPointReward] = useState(50);

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setPointReward(50);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setPointReward(cat.pointReward);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (await confirm("Apakah Anda yakin ingin menghapus kategori ini? Seluruh aktivitas yang terikat dengan kategori ini mungkin akan terdampak.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (name.trim().length < 3) {
      setErrorMsg("Nama kategori minimal 3 karakter");
      return;
    }
    if (pointReward <= 0) {
      setErrorMsg("Poin reward harus lebih besar dari 0");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      pointReward,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, body: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
            Kelola Kategori
          </h1>
          <p className="text-sm text-ink-400 mt-1">
            Atur master data kategori aktivitas pelaporan lingkungan beserta alokasi standar poin reward-nya.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-moss-700 px-4 py-2 text-sm font-medium text-paper-50 transition-all hover:bg-moss-900 shadow-sm self-start sm:self-auto"
        >
          + Tambah Kategori
        </button>
      </div>

      {isError && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-4 text-center text-sm text-rust-600">
          Gagal memuat kategori. Silakan coba lagi.
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 rounded bg-paper-100" />
          <div className="h-32 rounded bg-paper-100" />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400">
          <svg className="mx-auto h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-3 text-base font-semibold text-ink-900">Belum Ada Kategori</h3>
          <p className="mt-1 text-sm">Tekan tombol di atas untuk membuat kategori master pertama Anda.</p>
        </div>
      ) : (
        /* Inventory Table */
        <div className="rounded-lg border border-paper-200 bg-white shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-paper-100 bg-paper-50/50 font-mono text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
                <th className="px-5 py-3">Nama Kategori</th>
                <th className="px-5 py-3">Deskripsi</th>
                <th className="px-5 py-3">Standar Reward Poin</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-100 text-sm text-ink-700">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-paper-50/40">
                  <td className="px-5 py-3 font-semibold text-ink-900">
                    {cat.name}
                  </td>
                  <td className="px-5 py-3 text-ink-400 max-w-[300px] truncate" title={cat.description || ""}>
                    {cat.description || "-"}
                  </td>
                  <td className="px-5 py-3 font-mono font-semibold text-moss-700">
                    +{cat.pointReward} Pts
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="rounded-md border border-paper-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-700 hover:bg-paper-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
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

      {/* Category Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-lg border border-paper-200 bg-white p-6 shadow-xl space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-paper-100 pb-3">
              <h3 className="font-display text-lg font-bold text-ink-900">
                {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
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
              {/* Name */}
              <div className="space-y-1">
                <label htmlFor="catName" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Nama Kategori</label>
                <input
                  id="catName"
                  required
                  type="text"
                  placeholder="Contoh: Kertas & Karton"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                />
              </div>

              {/* Point Reward */}
              <div className="space-y-1">
                <label htmlFor="catReward" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Alokasi Standar Reward Poin</label>
                <input
                  id="catReward"
                  required
                  type="number"
                  min="1"
                  value={pointReward}
                  onChange={(e) => setPointReward(Number(e.target.value))}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label htmlFor="catDesc" className="text-xs font-semibold uppercase tracking-wider text-ink-400">Deskripsi Ringkas</label>
                <textarea
                  id="catDesc"
                  rows={2}
                  placeholder="Terangkan syarat aksi dan jenis sampah..."
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
                  {isSaving ? "Menyimpan..." : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
