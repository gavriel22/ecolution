"use client";

import { useState } from "react";
import Link from "next/link";
import { useOrders } from "@/features/marketplace/hooks/use-marketplace-mutations";
import type { Order, OrderStatus } from "@/features/marketplace/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Lunas",
  PROCESSING: "Diproses",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const STATUS_CLASSES: Record<OrderStatus, string> = {
  PENDING: "border-ochre-500 text-ochre-600",
  PAID: "border-moss-500 text-moss-700",
  PROCESSING: "border-moss-500 text-moss-700 bg-moss-50/30",
  COMPLETED: "bg-moss-700 text-paper-50 border-moss-700",
  CANCELLED: "border-rust-500 text-rust-600 bg-rust-50/10",
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useOrders({ page, limit: 10 });

  const orders = data?.orders || [];
  const meta = data?.meta;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
          Riwayat Transaksi
        </h1>
        <p className="font-body text-sm text-ink-400 mt-1">
          Pantau status pemesanan barang dan riwayat checkout belanjamu.
        </p>
      </div>

      {isError && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-4 text-center text-sm text-rust-600 font-body">
          Gagal memuat riwayat transaksi. Silakan coba lagi.
        </div>
      )}

      {isLoading ? (
        /* Loading skeleton */
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-paper-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-paper-100 pb-3">
                <div className="h-4 w-1/3 rounded bg-paper-100" />
                <div className="h-5 w-20 rounded bg-paper-100" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-2/3 rounded bg-paper-100" />
                <div className="h-5 w-1/2 rounded bg-paper-100" />
              </div>
              <div className="h-6 w-1/4 rounded bg-paper-100 pt-2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="rounded-lg border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400 max-w-lg mx-auto font-body">
          <svg className="mx-auto h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-3 text-base font-semibold text-ink-900">Belum Ada Transaksi</h3>
          <p className="mt-1 text-sm">Anda belum pernah melakukan pembelian produk apa pun.</p>
          <div className="mt-6">
            <Link href="/marketplace" className="inline-flex rounded-md bg-moss-700 px-4 py-2 text-sm font-semibold text-paper-50 hover:bg-moss-900 transition">
              Kunjungi Marketplace
            </Link>
          </div>
        </div>
      ) : (
        /* List */
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <div
              key={order.id}
              className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs space-y-4 font-body"
            >
              {/* Card Top Header info */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-paper-100 pb-3">
                <div className="space-y-0.5">
                  <p className="font-mono text-xs font-bold text-ink-900">
                    {order.orderNumber}
                  </p>
                  <p className="text-[10px] text-ink-400 font-mono">
                    Tanggal: {formatDate(order.createdAt)}
                  </p>
                </div>
                <span
                  className={`inline-block rounded-xs border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${STATUS_CLASSES[order.status]}`}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </div>

              {/* Items in order */}
              <div className="space-y-3 divide-y divide-paper-100">
                {order.items.map((item, idx) => (
                  <div key={item.id} className={`flex items-start gap-3 text-sm ${idx > 0 ? "pt-3" : ""}`}>
                    {/* Tiny Thumbnail */}
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-paper-100 bg-paper-50 flex items-center justify-center">
                      {item.product?.imageThumbnail ? (
                        <img src={item.product.imageThumbnail} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <svg className="h-5 w-5 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-900 truncate">
                        {item.product?.name || "Produk Terhapus"}
                      </p>
                      <p className="font-mono text-[10px] text-ink-400">
                        {item.product?.merchant?.businessName || "Mitra UMKM"} · {item.quantity} unit x {formatPrice(item.price)}
                      </p>
                    </div>

                    <span className="font-mono text-xs font-semibold text-ink-900 shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Card Footer pricing */}
              <div className="flex justify-between items-center border-t border-paper-100 pt-3 text-sm">
                <span className="text-ink-400 text-xs font-semibold uppercase tracking-wider">Total Pembayaran</span>
                <span className="font-display font-bold text-moss-700 text-base">
                  {formatPrice(order.totalPrice)}
                </span>
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
    </div>
  );
}
