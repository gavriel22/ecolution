"use client";

import { useMe } from "@/features/auth/hooks";

export default function DashboardPage() {
  const { data: user } = useMe();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
    </div>
  );
}
