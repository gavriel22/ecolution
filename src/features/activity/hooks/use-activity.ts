import { useQuery } from "@tanstack/react-query";
import { getActivity } from "../api";

export function useActivity(id: string | undefined) {
  return useQuery({
    queryKey: ["activity", id],
    queryFn: async () => (await getActivity(id as string)).data,
    enabled: !!id,
  });
}
