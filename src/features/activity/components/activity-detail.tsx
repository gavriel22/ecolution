"use client";

import { useRouter } from "next/navigation";
import { useActivity } from "../hooks/use-activity";
import { useDeleteActivity } from "../hooks/use-delete-activity";
import { useSubmitActivity } from "../hooks/use-submit-activity";
import { StatusBadge } from "./status-badge";
import { useConfirm } from "@/providers/confirm-provider";

export function ActivityDetail({ id }: { id: string }) {
  const confirm = useConfirm();
  const router = useRouter();
  const { data: activity, isLoading, isError } = useActivity(id);
  const deleteActivity = useDeleteActivity();
  const submitActivity = useSubmitActivity(id);

  if (isLoading) return <p className="text-sm text-ink-400">Memuat detail aktivitas...</p>;
  if (isError || !activity) return <p className="text-sm text-rust-600">Aktivitas tidak ditemukan.</p>;

  const date = new Date(activity.activityDate).toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const photo = activity.photos?.[0];

  return (
    <div className="mx-auto w-full max-w-lg space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold text-ink-900">{activity.title}</h1>
          <p className="font-mono text-xs text-ink-400">{activity.category?.name} · {date}</p>
        </div>
        <StatusBadge status={activity.status} />
      </div>

      {photo && (
        <div className="overflow-hidden rounded-md border border-paper-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.imageUrl} alt={activity.title} className="w-full object-cover" />
          <div className="flex items-center justify-between bg-paper-50 px-3 py-2 text-xs text-ink-400">
            <span>{photo.hasExif ? "✓ Metadata GPS & waktu terverifikasi" : "⚠ Tanpa metadata EXIF"}</span>
            {photo.takenAt && <span>{new Date(photo.takenAt).toLocaleDateString("id-ID")}</span>}
          </div>
        </div>
      )}

      {activity.description && <p className="text-sm text-ink-700">{activity.description}</p>}
      {activity.location && <p className="text-sm text-ink-400">📍 {activity.location}</p>}

      {activity.adminNote && (
        <div className="rounded-md border border-paper-200 bg-paper-50 p-3 text-sm text-ink-700">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-400">Catatan Admin</p>
          {activity.adminNote}
        </div>
      )}

      {activity.pointHistory && (
        <div className="rounded-md border border-ochre-500/30 bg-ochre-500/5 p-3 text-sm text-ochre-600">
          +{activity.pointHistory.point} poin diterima
        </div>
      )}

      {activity.status === "PENDING" && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={async () => {
              if (await confirm("Hapus aktivitas ini?")) {
                deleteActivity.mutate(id, { onSuccess: () => router.push("/activity") });
              }
            }}
            disabled={deleteActivity.isPending}
            className="flex-1 rounded-md border border-rust-500 px-4 py-2.5 font-medium text-rust-600 hover:bg-rust-500/5 disabled:opacity-60"
          >
            Hapus Aktivitas
          </button>
        </div>
      )}
    </div>
  );
}
