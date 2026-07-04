import { apiFetch } from "@/lib/api-client";
import type {
  Product,
  ProductListParams,
  CreateProductPayload,
  UpdateProductPayload,
  Order,
  CheckoutPayload,
} from "./types";

function buildQuery(params: Record<string, any>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function listProducts(params: ProductListParams = {}) {
  return apiFetch<Product[]>(`/api/product${buildQuery(params)}`);
}

export function getProduct(id: string) {
  return apiFetch<Product>(`/api/product/${id}`);
}

export function createProduct(payload: CreateProductPayload) {
  return apiFetch<Product>("/api/product", {
    method: "POST",
    body: payload,
  });
}

export function updateProduct(id: string, payload: UpdateProductPayload) {
  return apiFetch<Product>(`/api/product/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteProduct(id: string) {
  return apiFetch<{ message: string }>(`/api/product/${id}`, {
    method: "DELETE",
  });
}

export function checkoutOrder(payload: CheckoutPayload) {
  return apiFetch<Order>("/api/order", {
    method: "POST",
    body: payload,
  });
}

export function listOrders(params: { page?: number; limit?: number } = {}) {
  return apiFetch<Order[]>(`/api/order${buildQuery(params)}`);
}

export function getOrder(id: string) {
  return apiFetch<Order>(`/api/order/${id}`);
}
