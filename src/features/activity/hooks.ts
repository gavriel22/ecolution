import { fetchClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export const activityApi = {
  listActivities: async (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    
    const qs = searchParams.toString();
    const endpoint = `/api/activity${qs ? `?${qs}` : ""}`;
    
    // Using fetchClient but since it only returns `data.data`, we need metadata for pagination
    // So we use standard fetch for this specific call or we can modify fetchClient 
    // to return the full response. Let's do standard fetch with our token here for demonstration.
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const headers = new Headers({
      "Content-Type": "application/json",
    });
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(endpoint, { headers });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || "Failed to fetch activities");
    }
    return {
      data: json.data,
      meta: json.meta,
    };
  },
};

export const useActivities = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: ["activities", filters],
    queryFn: () => activityApi.listActivities(filters),
  });
};
