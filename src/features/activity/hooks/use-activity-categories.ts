import { useQuery } from "@tanstack/react-query";
import { getActivityCategories } from "../api";

/**
 * Fetches the active category list once and caches it — this is what powers
 * the category dropdown so users never have to know or type a categoryId.
 */
export function useActivityCategories() {
  return useQuery({
    queryKey: ["activity-categories"],
    queryFn: async () => (await getActivityCategories()).data,
    staleTime: 5 * 60 * 1000, // categories rarely change
  });
}
