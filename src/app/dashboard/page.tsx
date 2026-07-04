"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useActivities } from "@/features/activity/hooks/use-activities";
import { ActivitySummary } from "@/features/activity/components/activity-summary";
import { ActivityCard } from "@/features/activity/components/activity-card";
import type { Activity } from "@/features/activity/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useActivities({ limit: 5 });

  const recentActivities = data?.activities || [];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
            Dashboard
          </h1>
          <p className="font-body text-sm text-ink-400 mt-1">
            Selamat datang kembali, <span className="font-semibold text-moss-700">{user?.name}</span>! Pantau kontribusi lingkunganmu di sini.
          </p>
        </div>
        <Link
          href="/activity/new"
          className="inline-flex items-center justify-center rounded-md bg-moss-700 px-4 py-2 text-sm font-medium text-paper-50 transition-all hover:bg-moss-900 shadow-sm self-start sm:self-auto"
        >
          + Lapor Aktivitas Baru
        </Link>
      </div>

      {/* Summary Statistics Section */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-ink-900">
          Ringkasan Kontribusi
        </h2>
        <ActivitySummary />
      </div>

      {/* Recent Activities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-paper-200 pb-2">
          <h2 className="font-display text-2xl font-semibold text-ink-900">
            Aktivitas Terbaru
          </h2>
          {recentActivities.length > 0 && (
            <Link
              href="/activity"
              className="text-sm font-medium text-moss-700 hover:text-moss-900 hover:underline transition"
            >
              Lihat Semua →
            </Link>
          )}
        </div>

        {isLoading ? (
          <p className="font-body text-sm text-ink-400">Memuat aktivitas terbaru...</p>
        ) : recentActivities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-paper-200 bg-white p-8 text-center text-sm text-ink-400 font-body">
            Belum ada aktivitas terlaporkan. 
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
    </div>
  );
}
