"use client";

import { useMe } from "@/features/auth/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (isError) {
      router.push("/login");
    }
  }, [isError, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 200, padding: 20, borderRight: "1px solid #ccc" }}>
        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/activities">Activities</Link>
          <Link href="/activities/create">Create Activity</Link>
          <Link href="/profile">Profile</Link>
        </nav>
      </aside>
      <main style={{ padding: 20, flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
