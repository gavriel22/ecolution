"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "./status-badge";
import type { Activity } from "../types";

export function ActivityCard({ activity }: { activity: Activity }) {
  const [imgError, setImgError] = useState(false);

  const date = new Date(activity.activityDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Get the first photo URL if available
  const photo = activity.photos?.[0];
  const imageUrl = photo?.imageUrl;

  return (
    <Link
      href={`/activity/${activity.id}`}
      className="flex items-start gap-4 rounded-md border border-paper-200 bg-white p-4 transition hover:border-moss-500 hover:shadow-xs"
    >
      {/* Thumbnail image or icon fallback placeholder */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-paper-100 flex items-center justify-center border border-paper-200 relative">
        {imageUrl && !imgError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt={activity.title}
            onError={() => setImgError(true)}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-2xl" role="img" aria-label="Aktivitas">🌱</span>
        )}
      </div>

      {/* Main information content */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate font-semibold text-sm text-ink-900">{activity.title}</p>
          <StatusBadge status={activity.status} />
        </div>

        <p className="text-xs font-semibold text-moss-700">
          {activity.category?.name ?? "Kategori"}
        </p>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-ink-400 font-mono">
          <span className="flex items-center gap-1">
            <span>📅</span>
            <span>{date}</span>
          </span>
          {activity.location && (
            <>
              <span className="opacity-40">·</span>
              <span className="truncate max-w-[180px] flex items-center gap-0.5">
                <span>📍</span>
                <span className="truncate">{activity.location}</span>
              </span>
            </>
          )}
        </div>

        {/* Display point reward if the activity is APPROVED */}
        {activity.status === "APPROVED" && (
          <div className="mt-1 flex items-center gap-1 text-xs font-bold text-moss-700">
            <span role="img" aria-label="Koin">🪙</span>
            <span>+{activity.category?.pointReward ?? 0} Poin</span>
          </div>
        )}
      </div>
    </Link>
  );
}
