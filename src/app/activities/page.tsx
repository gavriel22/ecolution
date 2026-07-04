"use client";

import { useActivities } from "@/features/activity/hooks";
import { useMe } from "@/features/auth/hooks";

export default function ActivitiesPage() {
  const { data: user } = useMe();
  const { data: activitiesRes, isLoading } = useActivities({ userId: user?.id });

  if (isLoading) return <div>Loading activities...</div>;

  const activities = activitiesRes?.data || [];

  return (
    <div style={{ padding: 20 }}>
      <h1>Activities</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {activities.map((act: any) => (
          <li key={act.id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: 10 }}>
            <h3>{act.title}</h3>
            <p>Status: {act.status}</p>
            <p>Created At: {new Date(act.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
