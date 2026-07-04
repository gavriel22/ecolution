import type { ActivityStatus } from "../types";

const STYLES: Record<ActivityStatus, string> = {
  PENDING: "border-ochre-500 text-ochre-600",
  APPROVED: "border-moss-500 text-moss-700",
  REJECTED: "border-rust-500 text-rust-600",
};

const LABELS: Record<ActivityStatus, string> = {
  PENDING: "Menunggu Verifikasi",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

/**
 * Rendered like a field inspector's rubber stamp — double border, mono type,
 * slight rotation — echoing the "verified in the field" nature of the app.
 */
export function StatusBadge({ status }: { status: ActivityStatus }) {
  return (
    <span
      className={`inline-block -rotate-2 rounded-sm border-2 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
