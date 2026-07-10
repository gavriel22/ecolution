"use client";

import { useState } from "react";
import clsx from "clsx";

interface AvatarProps {
  /** Display name — used for the initials fallback. */
  name?: string | null;
  /** Remote image URL (e.g. Google profile picture). */
  src?: string | null;
  /** Tailwind size classes (h-/w-). Defaults to a 40px avatar. */
  className?: string;
  /** Extra classes for the fallback initials text. */
  fallbackClassName?: string;
}

/**
 * Renders a user's profile picture with a graceful initials fallback.
 *
 * Priority:
 *  1. `src` image (Google avatar, uploaded photo, …) — shown once it loads.
 *  2. Initials derived from `name` if there is no image or it fails to load.
 *
 * Works with any remote host (plain <img>, no next/image domain config needed)
 * and is fully responsive — size is driven entirely by the passed classes.
 */
export function Avatar({ name, src, className, fallbackClassName }: AvatarProps) {
  // Track *which* src failed rather than a boolean, so a changed src (e.g. after
  // a profile update) is retried automatically — no effect needed.
  const [erroredSrc, setErroredSrc] = useState<string | null>(null);

  const initials = getInitials(name);
  const showImage = Boolean(src) && erroredSrc !== src;

  return (
    <div
      className={clsx(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-moss-50 text-moss-700 font-display font-semibold uppercase select-none",
        "h-10 w-10 text-lg",
        className
      )}
    >
      {showImage ? (
        <img
          src={src as string}
          alt={name ? `Foto profil ${name}` : "Foto profil"}
          referrerPolicy="no-referrer"
          onError={() => setErroredSrc(src as string)}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <span className={clsx("leading-none", fallbackClassName)}>{initials}</span>
      )}
    </div>
  );
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
