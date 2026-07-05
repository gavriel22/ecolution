"use client";

import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useVouchers, useCreateVoucher, useUpdateVoucher, useDeleteVoucher } from "@/features/reward/hooks/use-rewards";
import type { Voucher, CreateVoucherPayload } from "@/features/reward/types";
import { toast } from "sonner";
import { useConfirm } from "@/providers/confirm-provider";

export default function AdminVoucherPage() {
  const confirm = useConfirm();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useVouchers({ page, limit: 10 });
  const vouchers = data?.vouchers || [];
  const meta = data?.meta;

  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();
  const deleteMutation = useDeleteVoucher();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointCost, setPointCost] = useState(100);
  const [discountAmount, setDiscountAmount] = useState(5000);
  const [stock, setStock] = useState(100);
  const [status, setStatus] = useState<"AVAILABLE" | "OUT_OF_STOCK" | "EXPIRED">("AVAILABLE");

  const openAddModal = () => {
    setEditingVoucher(null);
    setTitle("");
    setDescription("");
    setPointCost(100);
    setDiscountAmount(5000);
    setStock(100);
    setStatus("AVAILABLE");
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setTitle(voucher.title);
    setDescription(voucher.description || "");
    setPointCost(voucher.pointCost);
    setDiscountAmount(voucher.discountAmount);
    setStock(voucher.stock);
    setStatus(voucher.status as any);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (await confirm("Apakah Anda yakin ingin menghapus voucher ini?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Voucher berhasil dihapus!"),
        onError: (err: any) => toast.error(err.message || "Gagal menghapus voucher"),
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (title.trim().length < 3) {
      setErrorMsg("Judul voucher minimal 3 karakter");
      return;
    }
    if (pointCost <= 0) {
      setErrorMsg("Harga Poin harus lebih dari 0");
      return;
    }
    if (discountAmount < 0) {
      setErrorMsg("Nominal diskon tidak boleh negatif");
      return;
    }
    if (stock < 0) {
      setErrorMsg("Stok tidak boleh negatif");
      return;
    }

    const payload: CreateVoucherPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      pointCost,
      discountAmount,
      stock,
      status: editingVoucher ? status : undefined,
    } as any;

    if (editingVoucher) {
      updateMutation.mutate(
        { id: editingVoucher.id, payload },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            toast.success("Voucher berhasil diperbarui!");
          },
          onError: (err: any) => setErrorMsg(err.message || "Gagal memperbarui voucher"),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
          toast.success("Voucher berhasil ditambahkan!");
        },
        onError: (err: any) => setErrorMsg(err.message || "Gagal menambahkan voucher"),
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
            Kelola Voucher
          </h1>
          <p className="text-sm text-ink-400 mt-1">
            Atur dan kelola voucher penukaran poin untuk user.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-moss-700 px-4 py-2 text-sm font-medium text-paper-50 transition-all hover:bg-moss-900 shadow-sm self-start sm:self-auto"
        >
          + Tambah Voucher
        </button>
      </div>

      {isError && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-4 text-sm text-rust-600">
          Gagal memuat data voucher. Silakan muat ulang halaman.
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-paper-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink-700">
            <thead className="bg-paper-50 text-[10px] uppercase tracking-wider text-ink-400 font-mono border-b border-paper-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Voucher</th>
                <th className="px-6 py-4 font-semibold">Harga Poin</th>
                <th className="px-6 py-4 font-semibold">Diskon</th>
                <th className="px-6 py-4 font-semibold">Stok</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-ink-400 animate-pulse">
                    Memuat data...
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-ink-400">
                    <p className="font-semibold text-ink-900 mb-1">Belum ada voucher</p>
                    <p className="text-xs">Klik tombol tambah untuk membuat voucher baru.</p>
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-paper-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded border border-paper-200 bg-paper-50 overflow-hidden flex items-center justify-center">
                          <span className="text-lg">🎟️</span>
                        </div>
                        <div>
                          <p className="font-bold text-ink-900 leading-tight">{voucher.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-moss-700 bg-moss-50 px-2.5 py-1 rounded-md text-xs">
                        {voucher.pointCost} Pts
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-ink-900">
                      Rp {voucher.discountAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {voucher.stock}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono ${
                          voucher.status === "AVAILABLE"
                            ? "bg-moss-100 text-moss-800"
                            : voucher.status === "OUT_OF_STOCK"
                            ? "bg-rust-100 text-rust-800"
                            : "bg-paper-200 text-ink-600"
                        }`}
                      >
                        {voucher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(voucher)}
                          className="p-1.5 text-ink-400 hover:text-moss-600 hover:bg-moss-50 rounded transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(voucher.id)}
                          className="p-1.5 text-ink-400 hover:text-rust-600 hover:bg-rust-50 rounded transition-colors"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-paper-200 p-4 bg-paper-50">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 text-sm border border-paper-200 bg-white rounded hover:bg-paper-100 disabled:opacity-50 transition"
            >
              Sebelumnnya
            </button>
            <span className="text-xs font-mono text-ink-500">
              Halaman {meta.page} dari {meta.totalPages}
            </span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 text-sm border border-paper-200 bg-white rounded hover:bg-paper-100 disabled:opacity-50 transition"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-paper-100 flex items-center justify-between bg-paper-50 shrink-0">
              <h3 className="font-display font-bold text-lg text-ink-900">
                {editingVoucher ? "Edit Voucher" : "Tambah Voucher Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink-400 hover:text-ink-700 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-rust-50 border border-rust-200 text-sm text-rust-700">
                  {errorMsg}
                </div>
              )}

              <form id="voucher-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-1.5">Judul Voucher</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-md border border-paper-300 px-3 py-2 text-sm focus:border-moss-500 focus:outline-none focus:ring-1 focus:ring-moss-500"
                    placeholder="Contoh: Diskon 5rb Produk Ramah Lingkungan"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-1.5">Harga Poin (Pts)</label>
                    <input
                      type="number"
                      min={1}
                      value={pointCost}
                      onChange={(e) => setPointCost(Number(e.target.value))}
                      className="w-full rounded-md border border-paper-300 px-3 py-2 text-sm focus:border-moss-500 focus:outline-none focus:ring-1 focus:ring-moss-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-1.5">Diskon (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      className="w-full rounded-md border border-paper-300 px-3 py-2 text-sm focus:border-moss-500 focus:outline-none focus:ring-1 focus:ring-moss-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-1.5">Stok</label>
                    <input
                      type="number"
                      min={0}
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full rounded-md border border-paper-300 px-3 py-2 text-sm focus:border-moss-500 focus:outline-none focus:ring-1 focus:ring-moss-500"
                      required
                    />
                  </div>
                  {editingVoucher && (
                    <div>
                      <label className="block text-sm font-semibold text-ink-900 mb-1.5">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full rounded-md border border-paper-300 px-3 py-2 text-sm focus:border-moss-500 focus:outline-none focus:ring-1 focus:ring-moss-500 bg-white"
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                        <option value="EXPIRED">EXPIRED</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-1.5">Deskripsi</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-paper-300 px-3 py-2 text-sm focus:border-moss-500 focus:outline-none focus:ring-1 focus:ring-moss-500 custom-scrollbar"
                    placeholder="Syarat dan ketentuan, penjelasan voucher..."
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-paper-100 bg-paper-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-ink-600 hover:bg-paper-200 rounded-md transition"
              >
                Batal
              </button>
              <button
                type="submit"
                form="voucher-form"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-semibold text-white bg-moss-700 hover:bg-moss-800 rounded-md transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {editingVoucher ? "Simpan Perubahan" : "Simpan Voucher"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
