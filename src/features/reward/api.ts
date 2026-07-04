import { apiFetch } from "@/lib/api-client";
import type {
  Voucher,
  VoucherListParams,
  CreateVoucherPayload,
  UpdateVoucherPayload,
  VoucherRedemption,
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

export function listVouchers(params: VoucherListParams = {}) {
  return apiFetch<Voucher[]>(`/api/voucher${buildQuery(params)}`);
}

export function getVoucher(id: string) {
  return apiFetch<Voucher>(`/api/voucher/${id}`);
}

export function createVoucher(payload: CreateVoucherPayload) {
  return apiFetch<Voucher>("/api/voucher", {
    method: "POST",
    body: payload,
  });
}

export function updateVoucher(id: string, payload: UpdateVoucherPayload) {
  return apiFetch<Voucher>(`/api/voucher/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteVoucher(id: string) {
  return apiFetch<{ message: string }>(`/api/voucher/${id}`, {
    method: "DELETE",
  });
}

export function redeemReward(voucherId: string) {
  return apiFetch<VoucherRedemption>("/api/reward/redeem", {
    method: "POST",
    body: { voucherId },
  });
}

export function listRedemptionHistory(params: { page?: number; limit?: number } = {}) {
  return apiFetch<VoucherRedemption[]>(`/api/reward/history${buildQuery(params)}`);
}
