import { useQuery } from "@tanstack/react-query";
import { getProduct } from "../api";

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await getProduct(id);
      return res.data;
    },
    enabled: !!id,
  });
}
