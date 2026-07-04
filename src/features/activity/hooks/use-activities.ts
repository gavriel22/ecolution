import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { listActivities } from "../api";
import type { ActivityListParams } from "../types";

export function useActivities(params: ActivityListParams = {}) {
  return useQuery({
    queryKey: ["activities", params],
    queryFn: async () => {
      const res = await listActivities(params);
      return { activities: res.data, meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}
