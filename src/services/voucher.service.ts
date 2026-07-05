import { z } from "zod";
import { voucherRepository } from "@/repositories/voucher.repository";
import { UserRole, VoucherStatus } from "@prisma/client";
import {
  ValidationError,
  ForbiddenError,
  NotFoundError,
} from "@/utils/errors";

const createVoucherSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().max(1000).optional().nullable(),
  pointCost: z.preprocess((val) => Number(val), z.number().int().positive("Point cost must be greater than 0")),
  discountAmount: z.preprocess((val) => Number(val), z.number().int().nonnegative("Discount amount cannot be negative")),
  stock: z.preprocess((val) => Number(val), z.number().int().nonnegative("Stock cannot be negative")),
  expiredAt: z
    .preprocess((val) => (val ? new Date(val as string) : undefined), z.date().min(new Date(), "Expiry date must be in the future"))
    .optional()
    .nullable(),
});

const updateVoucherSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150).optional(),
  description: z.string().max(1000).optional().nullable(),
  pointCost: z.preprocess((val) => Number(val), z.number().int().positive("Point cost must be greater than 0")).optional(),
  discountAmount: z.preprocess((val) => Number(val), z.number().int().nonnegative("Discount amount cannot be negative")).optional(),
  stock: z.preprocess((val) => Number(val), z.number().int().nonnegative("Stock cannot be negative")).optional(),
  expiredAt: z
    .preprocess((val) => (val ? new Date(val as string) : undefined), z.date())
    .optional()
    .nullable(),
  status: z.nativeEnum(VoucherStatus).optional(),
});

export class VoucherService {
  private mapVoucher(voucher: any) {
    return {
      id: voucher.id,
      title: voucher.title,
      description: voucher.description,
      pointCost: voucher.pointCost,
      discountAmount: voucher.discountAmount,
      stock: voucher.stock,
      expiredAt: voucher.expiredAt,
      status: voucher.status,
      createdAt: voucher.createdAt,
      updatedAt: voucher.updatedAt,
    };
  }

  async createVoucher(userId: string, userRole: UserRole, data: unknown) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only Admins can create vouchers");
    }

    const parsed = createVoucherSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Invalid voucher data", parsed.error.format() as any);
    }

    const voucher = await voucherRepository.create({
      ...parsed.data,
      description: parsed.data.description ?? undefined,
      expiredAt: parsed.data.expiredAt ?? undefined,
    });

    return this.mapVoucher(voucher);
  }

  async getVoucher(id: string) {
    const voucher = await voucherRepository.findById(id);
    if (!voucher) {
      throw new NotFoundError("Voucher not found");
    }

    return this.mapVoucher(voucher);
  }

  async listVouchers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: VoucherStatus;
    minPointCost?: number;
    maxPointCost?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const result = await voucherRepository.findAll({
      page,
      limit,
      skip,
      ...params,
    });

    return {
      vouchers: result.vouchers.map((v) => this.mapVoucher(v)),
      meta: {
        page,
        limit,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / limit),
      },
    };
  }

  async updateVoucher(id: string, userId: string, userRole: UserRole, data: unknown) {
    const voucher = await voucherRepository.findById(id);
    if (!voucher) {
      throw new NotFoundError("Voucher not found");
    }

    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only Admins can update vouchers");
    }

    const parsed = updateVoucherSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Invalid update data", parsed.error.format() as any);
    }

    const updated = await voucherRepository.update(id, {
      ...parsed.data,
      description: parsed.data.description ?? undefined,
      expiredAt: parsed.data.expiredAt ?? undefined,
    });

    return this.mapVoucher(updated);
  }

  async deleteVoucher(id: string, userId: string, userRole: UserRole) {
    const voucher = await voucherRepository.findById(id);
    if (!voucher) {
      throw new NotFoundError("Voucher not found");
    }

    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only Admins can delete vouchers");
    }

    await voucherRepository.delete(id);
  }
}

export const voucherService = new VoucherService();
