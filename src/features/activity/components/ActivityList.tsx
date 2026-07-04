"use client";

import React, { useState } from "react";
import { useActivities } from "../hooks";

export function ActivityList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useActivities({ page, limit: 10 });

  if (isLoading) return <div>Loading activities...</div>;
  if (error) return <div>Error loading activities: {error.message}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Activities</h2>
      {data?.data.length === 0 ? (
        <p>No activities found.</p>
      ) : (
        <ul className="space-y-4">
          {data?.data.map((activity: any) => (
            <li key={activity.id} className="border p-4 rounded shadow">
              <h3 className="font-semibold">{activity.title}</h3>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <div className="mt-2 text-xs">
                Status: <span className="font-medium text-blue-600">{activity.status}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1">Page {data?.meta?.currentPage || page}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={!data?.meta?.hasNextPage}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
