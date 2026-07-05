export type VoucherStatus = "AVAILABLE" | "OUT_OF_STOCK" | "EXPIRED";
export type RedemptionStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED" | "USED";

export interface Voucher {
  id: string;
  title: string;
  description: string | null;
  pointCost: number;
  discountAmount: number;
  stock: number;
  expiredAt: string | null;
  status: VoucherStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherRedemption {
  id: string;
  voucherId: string;
  userId: string;
  voucherCode: string;
  status: RedemptionStatus;
  redeemedAt: string;
  completedAt: string | null;
  usedAt: string | null;
  usedInOrderId: string | null;
  voucher?: {
    id: string;
    title: string;
    pointCost: number;
    discountAmount: number;
  };
}

export interface VoucherListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: VoucherStatus;
  minPointCost?: number;
  maxPointCost?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateVoucherPayload {
  title: string;
  description?: string | null;
  pointCost: number;
  discountAmount: number;
  stock: number;
  expiredAt?: string | null;
}

export interface UpdateVoucherPayload {
  title?: string;
  description?: string | null;
  pointCost?: number;
  discountAmount?: number;
  stock?: number;
  expiredAt?: string | null;
  status?: VoucherStatus;
}
