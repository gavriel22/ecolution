"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { usePathname } from "next/navigation";

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Dashboard management routes that require AppLayout (Dashboard Sidebar)
  const isDashboardRoute =
    pathname.startsWith("/merchant/products") ||
    pathname.startsWith("/merchant/orders") ||
    pathname.startsWith("/merchant/statistics") ||
    pathname.startsWith("/merchant/profile");

  if (isDashboardRoute) {
    return <AppLayout>{children}</AppLayout>;
  }

  // Public / non-management pages (like merchant store or registration page)
  return <>{children}</>;
}
