export type VoucherStatus = "AVAILABLE" | "OUT_OF_STOCK" | "EXPIRED";
export type RedemptionStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED";

export interface VoucherCategory {
  id: string;
  name: string;
}

export interface VoucherMerchant {
  id: string;
  businessName: string;
  logoUrl: string | null;
  ownerId: string;
}

export interface Voucher {
  id: string;
  merchantId: string;
  categoryId: string;
  title: string;
  description: string | null;
  pointCost: number;
  stock: number;
  imageUrl: string | null;
  expiredAt: string | null;
  status: VoucherStatus;
  createdAt: string;
  updatedAt: string;
  category?: VoucherCategory;
  merchant?: VoucherMerchant;
}

export interface VoucherRedemption {
  id: string;
  voucherId: string;
  userId: string;
  voucherCode: string;
  status: RedemptionStatus;
  redeemedAt: string;
  completedAt: string | null;
  voucher?: {
    id: string;
    title: string;
    pointCost: number;
    imageUrl: string | null;
    merchant?: {
      id: string;
      businessName: string;
    };
  };
}

export interface VoucherListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  merchantId?: string;
  status?: VoucherStatus;
  minPointCost?: number;
  maxPointCost?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateVoucherPayload {
  categoryId: string;
  title: string;
  description?: string | null;
  pointCost: number;
  stock: number;
  imageUrl?: string | null;
  expiredAt?: string | null;
}

export interface UpdateVoucherPayload {
  categoryId?: string;
  title?: string;
  description?: string | null;
  pointCost?: number;
  stock?: number;
  imageUrl?: string | null;
  expiredAt?: string | null;
  status?: VoucherStatus;
}
