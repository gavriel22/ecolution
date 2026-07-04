"use client";

import { useMe } from "@/features/auth/hooks";

export default function ProfilePage() {
  const { data: user, isLoading } = useMe();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Profile</h1>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
}
