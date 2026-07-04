import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export function useAdminDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard-metrics", "admin"],
    queryFn: async () => {
      const res = await apiFetch<any>("/api/dashboard/admin");
      return res.data;
    },
  });
}

export function useUserDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard-metrics", "user"],
    queryFn: async () => {
      const res = await apiFetch<any>("/api/dashboard/user");
      return res.data;
    },
  });
}

export function useMerchantDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard-metrics", "merchant"],
    queryFn: async () => {
      const res = await apiFetch<any>("/api/dashboard/merchant");
      return res.data;
    },
  });
}
