"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useActivities } from "@/features/activity/hooks/use-activities";
import { ActivitySummary } from "@/features/activity/components/activity-summary";
import { ActivityCard } from "@/features/activity/components/activity-card";
import {
  useAdminDashboardMetrics,
  useUserDashboardMetrics,
  useMerchantDashboardMetrics,
} from "@/features/activity/hooks/use-dashboard-metrics";
import type { Activity } from "@/features/activity/types";

export default function DashboardPage() {
  const { user, activeRole } = useAuth();

  if (!user) return null;

  const currentRole = activeRole || user.role;

  if (currentRole === "ADMIN") {
    return <AdminDashboard name={user.name} />;
  }

  if (currentRole === "UMKM") {
    return <MerchantDashboard name={user.name} />;
  }

  // Default to USER
  return <UserDashboard name={user.name} />;
}

// ----------------------------------------------------
// 1. USER DASHBOARD VIEW
// ----------------------------------------------------
function UserDashboard({ name }: { name: string }) {
  const { data, isLoading } = useActivities({ limit: 5 });
  const recentActivities = data?.activities || [];
  const { data: metrics, isLoading: isLoadingMetrics } = useUserDashboardMetrics();
  const topUsers = metrics?.topUsers || [];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
            Dashboard
          </h1>
          <p className="font-body text-sm text-ink-400 mt-1">
            Selamat datang kembali, <span className="font-semibold text-moss-700">{name}</span>! Pantau kontribusi lingkunganmu di sini.
          </p>
        </div>
      </div>

      {/* Summary Statistics Section */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-ink-900">
          Ringkasan Kontribusi
        </h2>
        <ActivitySummary />
      </div>

      {/* Recent Activities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-paper-200 pb-2">
          <h2 className="font-display text-xl font-semibold text-ink-900">
            Aktivitas Terbaru
          </h2>
          {recentActivities.length > 0 && (
            <Link
              href="/activity"
              className="text-sm font-medium text-moss-700 hover:text-moss-900 hover:underline transition font-body"
            >
              Lihat Semua →
            </Link>
          )}
        </div>

        {isLoading ? (
          <p className="font-body text-sm text-ink-400 animate-pulse">Memuat aktivitas terbaru...</p>
        ) : recentActivities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-paper-200 bg-white p-8 text-center text-sm text-ink-400 font-body">
            Belum ada aktivitas terlaporkan.{" "}
            <Link href="/activity/new" className="text-moss-700 hover:underline ml-1 font-medium">
              Laporkan aktivitas lingkungan pertamamu sekarang!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {recentActivities.map((activity: Activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard user list */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-ink-900 border-b border-paper-200 pb-2">
          Peringkat Pengguna Teraktif (Top Points)
        </h2>
        <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs">
          {isLoadingMetrics ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-6 bg-paper-50 rounded" />
              <div className="h-6 bg-paper-50 rounded" />
            </div>
          ) : topUsers.length === 0 ? (
            <div className="py-6 text-center text-ink-400 text-sm font-body">
              Belum ada data peringkat pengguna.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-body">
                <thead>
                  <tr className="border-b border-paper-100 text-[10px] font-mono uppercase tracking-wider text-ink-400 font-semibold">
                    <th className="py-2">Rank</th>
                    <th className="py-2">Nama</th>
                    <th className="py-2">Username</th>
                    <th className="py-2 text-right">Poin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-100 text-sm text-ink-700">
                  {topUsers.map((usr: any, index: number) => (
                    <tr key={usr.id} className="hover:bg-paper-50/30">
                      <td className="py-2.5 font-mono font-bold text-moss-700">#{index + 1}</td>
                      <td className="py-2.5 font-semibold text-ink-900">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full overflow-hidden bg-paper-100 border border-paper-200 flex items-center justify-center shrink-0">
                            {usr.profileImageUrl ? (
                              <img src={usr.profileImageUrl} alt={usr.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="font-display text-xs font-semibold text-moss-700">
                                {usr.name ? usr.name[0].toUpperCase() : "?"}
                              </span>
                            )}
                          </div>
                          <span>{usr.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 font-mono text-xs">@{usr.username}</td>
                      <td className="py-2.5 font-mono font-bold text-right text-moss-700">{usr.totalPoint} Pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ----------------------------------------------------
// 2. MERCHANT (UMKM) DASHBOARD VIEW
// ----------------------------------------------------
function MerchantDashboard({ name }: { name: string }) {
  const { data: metrics, isLoading: isLoadingMetrics, isError } = useMerchantDashboardMetrics();

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isError) {
    return (
      <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-6 text-center text-sm text-rust-600 font-body">
        Gagal memuat analitik mitra bisnis. Silakan refresh halaman.
      </div>
    );
  }

  const sales = metrics?.salesSummary || { totalRevenue: 0, totalItemsSold: 0, totalOrders: 0 };
  const recentProducts = metrics?.recentProducts || [];
  const recentOrders = metrics?.recentOrders || [];

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
            Panel Mitra Bisnis
          </h1>
          <p className="font-body text-sm text-ink-400 mt-1">
            Selamat datang, pemilik <span className="font-semibold text-moss-700">{name}</span>. Kelola performa penjualan dan produk Anda di sini.
          </p>
        </div>
        <Link
          href="/merchant/products"
          className="inline-flex items-center justify-center rounded-md bg-moss-700 px-4 py-2 text-sm font-medium text-paper-50 transition-all hover:bg-moss-900 shadow-sm self-start sm:self-auto"
        >
          Kelola Katalog Produk
        </Link>
      </div>

      {isLoadingMetrics ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded bg-paper-100 border border-paper-200" />
          ))}
        </div>
      ) : (
        /* Summary Grid */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Total Produk</p>
              <p className="mt-2 font-display text-3xl font-bold text-ink-900">{metrics?.totalProducts ?? 0}</p>
            </div>
            <p className="mt-2 text-[10px] text-ink-400">Jumlah produk terdaftar</p>
          </div>

          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Produk Aktif</p>
              <p className="mt-2 font-display text-3xl font-bold text-moss-700">{metrics?.activeProducts ?? 0}</p>
            </div>
            <p className="mt-2 text-[10px] text-ink-400">Status produk yang aktif dijual</p>
          </div>

          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Produk Habis</p>
              <p className="mt-2 font-display text-3xl font-bold text-rust-600">{metrics?.outOfStockProducts ?? 0}</p>
            </div>
            <p className="mt-2 text-[10px] text-ink-400">Jumlah produk dengan stok kosong</p>
          </div>

          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Total Pesanan</p>
              <p className="mt-2 font-display text-3xl font-bold text-ochre-600">{sales.totalOrders}</p>
            </div>
            <p className="mt-2 text-[10px] text-ink-400">Jumlah transaksi pembayaran lunas</p>
          </div>

          <div className="rounded-lg border border-moss-200 bg-moss-900 text-paper-50 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider opacity-80">Pendapatan Bersih</p>
              <p className="mt-2 font-display text-2xl font-bold text-ochre-400">{formatPrice(sales.totalRevenue)}</p>
            </div>
            <p className="mt-2 text-[10px] opacity-75">Akumulasi hasil penjualan produk</p>
          </div>
        </div>
      )}

      {/* Columns: Sales & Products list */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders / Sales */}
        <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="font-display text-lg font-bold text-ink-900 border-b border-paper-100 pb-2">
            Pesanan Terbaru
          </h3>

          {isLoadingMetrics ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-10 bg-paper-50 rounded" />
              <div className="h-10 bg-paper-50 rounded" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-8 text-center text-ink-400 text-sm">
              Belum ada pesanan lunas yang tercatat.
            </div>
          ) : (
            <div className="divide-y divide-paper-100">
              {recentOrders.map((ord: any) => (
                <div key={ord.id} className="py-3 flex justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-ink-900">{ord.orderNumber}</p>
                    <p className="text-xs text-ink-400 truncate mt-0.5">
                      Pembeli: {ord.buyerName} · {ord.itemsCount} barang
                    </p>
                    <p className="text-[10px] text-ink-450 font-mono mt-0.5">{formatDate(ord.createdAt)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="font-mono font-semibold text-moss-700 block">
                      {formatPrice(ord.totalPrice)}
                    </span>
                    <span className="inline-block rounded-xs bg-moss-700 px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase tracking-wider">
                      Lunas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="font-display text-lg font-bold text-ink-900 border-b border-paper-100 pb-2">
            Produk Terbaru
          </h3>

          {isLoadingMetrics ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-10 bg-paper-50 rounded" />
              <div className="h-10 bg-paper-50 rounded" />
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="py-8 text-center text-ink-400 text-sm">
              Belum ada produk terdaftar.
            </div>
          ) : (
            <div className="divide-y divide-paper-100">
              {recentProducts.map((prod: any) => (
                <div key={prod.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-paper-100 bg-paper-50 flex items-center justify-center">
                      {prod.imageThumbnail ? (
                        <img loading="lazy" decoding="async" src={prod.imageThumbnail} alt={prod.name} className="h-full w-full object-cover" />
                      ) : (
                        <svg className="h-5 w-5 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <span className="font-semibold text-ink-900 truncate max-w-[160px]">
                      {prod.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-moss-700">{formatPrice(prod.price)}</p>
                    <p className="text-[10px] text-ink-400 font-mono mt-0.5">Stok: {prod.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. ADMIN DASHBOARD VIEW
// ----------------------------------------------------
function AdminDashboard({ name }: { name: string }) {
  const { data: metrics, isLoading, isError } = useAdminDashboardMetrics();

  if (isError) {
    return (
      <div className="rounded-md border border-rust-500/30 bg-rust-500/5 p-6 text-center text-sm text-rust-600 font-body">
        Gagal memuat statistik sistem. Silakan refresh halaman.
      </div>
    );
  }

  const counts = metrics?.activitiesCount || { PENDING: 0, APPROVED: 0, REJECTED: 0, TOTAL: 0 };
  const topUsers = metrics?.topUsers || [];

  return (
    <div className="space-y-8 font-body">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
          Panel Administrator
        </h1>
        <p className="font-body text-sm text-ink-400 mt-1">
          Selamat datang, <span className="font-semibold text-moss-700">{name}</span>. Kelola operasional, verifikasi laporan, dan pantau metrik platform Ecolution.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded bg-paper-100 border border-paper-200" />
          ))}
        </div>
      ) : (
        /* Metrics Grid */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Total Pengguna</p>
            <p className="mt-2 font-display text-3xl font-bold text-ink-900">{metrics?.totalUsers ?? 0}</p>
            <p className="mt-2 text-[10px] text-ink-400">User aktif terdaftar</p>
          </div>

          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Total Mitra UMKM</p>
            <p className="mt-2 font-display text-3xl font-bold text-moss-700">{metrics?.totalMerchants ?? 0}</p>
            <p className="mt-2 text-[10px] text-ink-400">Merchant terdaftar & aktif</p>
          </div>

          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Sirkulasi Poin</p>
            <p className="mt-2 font-display text-3xl font-bold text-ochre-600">{metrics?.totalPointsCirculation ?? 0} Pts</p>
            <p className="mt-2 text-[10px] text-ink-400">Akumulasi poin dalam wallet user</p>
          </div>

          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Total Aktivitas</p>
            <p className="mt-2 font-display text-3xl font-bold text-ink-900">{counts.TOTAL}</p>
            <p className="mt-2 text-[10px] text-ink-400">Laporan aksi lingkungan terkumpul</p>
          </div>

          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Total Produk</p>
            <p className="mt-2 font-display text-3xl font-bold text-ink-900">{metrics?.totalProducts ?? 0}</p>
            <p className="mt-2 text-[10px] text-ink-400">Produk UMKM terdaftar</p>
          </div>

          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Total Transaksi</p>
            <p className="mt-2 font-display text-3xl font-bold text-ochre-600">{metrics?.totalTransactions ?? 0}</p>
            <p className="mt-2 text-[10px] text-ink-400">Transaksi lunas/berjalan</p>
          </div>

          <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-400">Total Voucher</p>
            <p className="mt-2 font-display text-3xl font-bold text-moss-700">{metrics?.totalVouchers ?? 0}</p>
            <p className="mt-2 text-[10px] text-ink-400">Voucher tersedia untuk ditukar</p>
          </div>
        </div>
      )}

      {/* Activity Verification metrics */}
      <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs space-y-4">
        <h3 className="font-display text-lg font-bold text-ink-900 border-b border-paper-100 pb-2">
          Verifikasi Aksi Lingkungan
        </h3>

        {isLoading ? (
          <div className="h-20 bg-paper-50 animate-pulse rounded" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-center">
            <div className="p-4 bg-ochre-50/20 border border-ochre-200 rounded-md">
              <p className="font-mono text-xs font-semibold text-ochre-700">Perlu Verifikasi (PENDING)</p>
              <p className="mt-2 font-display text-2xl font-bold text-ochre-600">{counts.PENDING}</p>
              <Link
                href="/admin/activity"
                className="mt-2 inline-block text-xs font-bold text-ochre-700 underline hover:text-ochre-800"
              >
                Proses Sekarang &rarr;
              </Link>
            </div>

            <div className="p-4 bg-moss-50 border border-moss-200 rounded-md">
              <p className="font-mono text-xs font-semibold text-moss-700">Disetujui (APPROVED)</p>
              <p className="mt-2 font-display text-2xl font-bold text-moss-700">{counts.APPROVED}</p>
              <p className="mt-2 text-[10px] text-ink-400">Poin reward teralokasi</p>
            </div>

            <div className="p-4 bg-rust-50/10 border border-rust-200 rounded-md">
              <p className="font-mono text-xs font-semibold text-rust-600">Ditolak (REJECTED)</p>
              <p className="mt-2 font-display text-2xl font-bold text-rust-600">{counts.REJECTED}</p>
              <p className="mt-2 text-[10px] text-ink-400 font-mono">Aksi tidak memenuhi validasi  Admin</p>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard user list */}
      <div className="rounded-lg border border-paper-200 bg-white p-5 shadow-xs space-y-4">
        <h3 className="font-display text-lg font-bold text-ink-900 border-b border-paper-100 pb-2">
          Peringkat Poin Pengguna
        </h3>

        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-6 bg-paper-50 rounded" />
            <div className="h-6 bg-paper-50 rounded" />
          </div>
        ) : topUsers.length === 0 ? (
          <div className="py-6 text-center text-ink-400 text-sm">
            Belum ada data peringkat pengguna.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-paper-100 text-[10px] font-mono uppercase tracking-wider text-ink-400 font-semibold">
                  <th className="py-2">Rank</th>
                  <th className="py-2">Nama</th>
                  <th className="py-2">Username</th>
                  <th className="py-2 text-right">Poin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-100 text-sm text-ink-700">
                {topUsers.map((usr: any, index: number) => (
                  <tr key={usr.id} className="hover:bg-paper-50/30">
                    <td className="py-2.5 font-mono font-bold text-moss-700">#{index + 1}</td>
                    <td className="py-2.5 font-semibold text-ink-900">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full overflow-hidden bg-paper-100 border border-paper-200 flex items-center justify-center shrink-0">
                          {usr.profileImageUrl ? (
                            <img src={usr.profileImageUrl} alt={usr.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="font-display text-xs font-semibold text-moss-700">
                              {usr.name ? usr.name[0].toUpperCase() : "?"}
                            </span>
                          )}
                        </div>
                        <span>{usr.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 font-mono text-xs">@{usr.username}</td>
                    <td className="py-2.5 font-mono font-bold text-right text-moss-700">{usr.totalPoint} Pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
