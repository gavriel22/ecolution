"use client";

import { useUserDashboardMetrics } from "../hooks/use-dashboard-metrics";

export function ActivitySummary() {
  const { data: metrics, isLoading } = useUserDashboardMetrics();

  const stats = [
    {
      label: "Total Poin",
      value: isLoading ? "..." : metrics?.totalPoint ?? 0,
      description: "Poin terkumpul saat ini",
      bgColor: "bg-moss-900 text-paper-50",
      valueClass: "font-display text-3xl font-bold text-ochre-400",
      dot: null,
    },
    {
      label: "Skor Kepercayaan",
      value: isLoading ? "..." : `${metrics?.trustScore ?? 0}%`,
      description: "Akurasi data foto & GPS",
      bgColor: "bg-white text-ink-900",
      valueClass: "font-mono text-3xl font-bold text-moss-700",
      dot: null,
    },
    {
      label: "Total Aksi",
      value: isLoading ? "..." : metrics?.activitiesCount?.TOTAL ?? 0,
      description: "Aksi lingkungan terlaporkan",
      bgColor: "bg-white text-ink-900",
      valueClass: "font-display text-3xl font-bold text-ink-900",
      dot: null,
    },
    {
      label: "Disetujui",
      value: isLoading ? "..." : metrics?.activitiesCount?.APPROVED ?? 0,
      description: "Mendapatkan poin reward",
      bgColor: "bg-white text-ink-900",
      valueClass: "font-display text-3xl font-semibold text-moss-700",
      dot: { color: "bg-moss-500", label: "APPROVED" },
    },
    {
      label: "Menunggu",
      value: isLoading ? "..." : metrics?.activitiesCount?.PENDING ?? 0,
      description: "Sedang proses verifikasi AI",
      bgColor: "bg-white text-ink-900",
      valueClass: "font-display text-3xl font-semibold text-ochre-600",
      dot: { color: "bg-ochre-500", label: "PENDING" },
    },
    {
      label: "Ditolak",
      value: isLoading ? "..." : metrics?.activitiesCount?.REJECTED ?? 0,
      description: "Aksi tidak memenuhi kriteria",
      bgColor: "bg-white text-ink-900",
      valueClass: "font-display text-3xl font-semibold text-rust-600",
      dot: { color: "bg-rust-500", label: "REJECTED" },
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`flex flex-col justify-between rounded-lg border border-paper-200 p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${stat.bgColor}`}
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-wider opacity-80">{stat.label}</p>
              {stat.dot && (
                <span className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${stat.dot.color}`} aria-hidden="true" />
                </span>
              )}
            </div>
            <p className={`mt-2 ${stat.valueClass}`}>{stat.value}</p>
          </div>
          <p className="mt-2 text-xs opacity-75 font-body">{stat.description}</p>
        </div>
      ))}
    </div>
  );
}
