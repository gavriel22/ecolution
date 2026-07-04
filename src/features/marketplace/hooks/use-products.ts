import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { listProducts } from "../api";
import type { ProductListParams } from "../types";

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await listProducts(params);
      return { products: res.data, meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}
