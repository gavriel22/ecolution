import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listVouchers,
  getVoucher,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  redeemReward,
  listRedemptionHistory,
} from "../api";
import type {
  VoucherListParams,
  CreateVoucherPayload,
  UpdateVoucherPayload,
} from "../types";

export function useVouchers(params: VoucherListParams = {}) {
  return useQuery({
    queryKey: ["vouchers", params],
    queryFn: async () => {
      const res = await listVouchers(params);
      return { vouchers: res.data, meta: res.meta };
    },
  });
}

export function useVoucher(id: string) {
  return useQuery({
    queryKey: ["voucher", id],
    queryFn: async () => {
      const res = await getVoucher(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVoucherPayload) => createVoucher(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
}

export function useUpdateVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVoucherPayload }) =>
      updateVoucher(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["voucher", variables.id] });
    },
  });
}

export function useDeleteVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
}

export function useRedeemReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (voucherId: string) => redeemReward(voucherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["redemptions"] });
      // Invalidate auth-context profile points
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useRedemptionHistory(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["redemptions", params],
    queryFn: async () => {
      const res = await listRedemptionHistory(params);
      return { redemptions: res.data, meta: res.meta };
    },
  });
}
