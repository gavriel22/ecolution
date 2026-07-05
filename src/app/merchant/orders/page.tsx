"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Lunas",
  PROCESSING: "Diproses",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const STATUS_CLASSES: Record<string, string> = {
  PENDING: "border-ochre-500 text-ochre-600 bg-ochre-50/20",
  PAID: "border-moss-500 text-moss-700 bg-moss-50/20",
  PROCESSING: "border-moss-500 text-moss-700 bg-moss-50/30",
  COMPLETED: "bg-moss-700 text-paper-50 border-moss-700",
  CANCELLED: "border-rust-500 text-rust-600 bg-rust-50/10",
};

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  function fetchOrders() {
    setLoading(true);
    apiFetch<any>("/api/merchant/orders")
      .then((res) => {
        setOrders(res.data.orders || []);
      })
      .catch((err) => {
        console.error("Failed to load orders", err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    setUpdatingId(orderId);
    try {
      await apiFetch(`/api/order/${orderId}`, {
        method: "PUT",
        body: { status: newStatus },
      });
      const updated = orders.map((ord) => {
        if (ord.id === orderId) {
          return { ...ord, status: newStatus };
        }
        return ord;
      });
      setOrders(updated);
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Gagal mengubah status pesanan.");
    } finally {
      setUpdatingId(null);
    }
  }

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
    <div className="space-y-6 font-body">
      <div>
        <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
          Kelola Pesanan Masuk
        </h1>
        <p className="font-body text-sm text-ink-400 mt-1">
          Pantau dan kelola pesanan produk ramah lingkungan dari pelanggan Anda.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-4 text-center text-sm text-rust-600">
          Gagal memuat pesanan. Silakan coba lagi.
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-paper-200 bg-white p-5 h-36" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-paper-200 bg-white p-12 text-center text-ink-400 max-w-lg mx-auto">
          <svg className="mx-auto h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-3 text-base font-semibold text-ink-900">Belum Ada Pesanan</h3>
          <p className="mt-1 text-sm text-ink-400">Belum ada pelanggan yang memesan produk dari toko Anda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs space-y-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-paper-100 pb-3">
                <div>
                  <p className="font-mono text-xs font-bold text-ink-900">{order.orderNumber}</p>
                  <p className="text-[10px] text-ink-400 font-mono mt-0.5">
                    Tanggal: {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${STATUS_CLASSES[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <select
                    disabled={updatingId === order.id}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="rounded border border-paper-200 bg-white px-2 py-1 text-xs font-semibold text-ink-700 outline-none focus:border-moss-500 focus:ring-1 focus:ring-moss-500/20"
                  >
                    <option value="PENDING">Menunggu Pembayaran</option>
                    <option value="PAID">Lunas</option>
                    <option value="PROCESSING">Diproses</option>
                    <option value="COMPLETED">Selesai</option>
                    <option value="CANCELLED">Dibatalkan</option>
                  </select>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-3">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-start gap-3 text-sm">
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
                      <p className="font-semibold text-ink-900 truncate">{item.product?.name || "Produk Terhapus"}</p>
                      <p className="font-mono text-[10px] text-ink-400 mt-0.5">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    
                    <span className="font-mono text-xs font-semibold text-ink-900 shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Customer details */}
              <div className="border-t border-paper-100 pt-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs">
                <div className="text-ink-400">
                  <span className="font-semibold text-ink-700">Pembeli:</span> {order.user?.name} ({order.user?.email}) {order.user?.phone && `· ${order.user.phone}`}
                  {order.note && <p className="mt-1 italic text-ink-500">{order.note}</p>}
                </div>
                <div className="text-right w-full md:w-auto">
                  <span className="text-ink-400 font-semibold mr-2 uppercase tracking-wider text-[10px]">Total Pembayaran</span>
                  <span className="font-display font-bold text-moss-700 text-base">
                    {formatPrice(order.items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
