import Link from "next/link";
import { StatusBadge } from "./status-badge";
import type { Activity } from "../types";

export function ActivityCard({ activity }: { activity: Activity }) {
  const date = new Date(activity.activityDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/activity/${activity.id}`}
      className="flex items-center justify-between gap-4 rounded-md border border-paper-200 bg-white p-4 transition hover:border-moss-500"
    >
      <div className="min-w-0 space-y-1">
        <p className="truncate font-medium text-ink-900">{activity.title}</p>
        <p className="font-mono text-xs text-ink-400">
          {activity.category?.name ?? "—"} · {date}
        </p>
      </div>
      <StatusBadge status={activity.status} />
    </Link>
  );
}
