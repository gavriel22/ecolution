import { z } from "zod";
import { voucherRepository } from "@/repositories/voucher.repository";
import { merchantRepository } from "@/repositories/merchant.repository";
import { UserRole, VoucherStatus } from "@prisma/client";
import {
  ValidationError,
  ForbiddenError,
  NotFoundError,
} from "@/utils/errors";

const createVoucherSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID format"),
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().max(1000).optional().nullable(),
  pointCost: z.preprocess((val) => Number(val), z.number().int().positive("Point cost must be greater than 0")),
  stock: z.preprocess((val) => Number(val), z.number().int().nonnegative("Stock cannot be negative")),
  imageUrl: z.string().max(255).url("Invalid image URL").optional().nullable(),
  expiredAt: z
    .preprocess((val) => (val ? new Date(val as string) : undefined), z.date().min(new Date(), "Expiry date must be in the future"))
    .optional()
    .nullable(),
});

const updateVoucherSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID format").optional(),
  title: z.string().min(3, "Title must be at least 3 characters").max(150).optional(),
  description: z.string().max(1000).optional().nullable(),
  pointCost: z.preprocess((val) => Number(val), z.number().int().positive("Point cost must be greater than 0")).optional(),
  stock: z.preprocess((val) => Number(val), z.number().int().nonnegative("Stock cannot be negative")).optional(),
  imageUrl: z.string().max(255).url("Invalid image URL").optional().nullable(),
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
      merchantId: voucher.merchantId,
      categoryId: voucher.categoryId,
      title: voucher.title,
      description: voucher.description,
      pointCost: voucher.pointCost,
      stock: voucher.stock,
      imageUrl: voucher.imageUrl,
      expiredAt: voucher.expiredAt,
      status: voucher.status,
      createdAt: voucher.createdAt,
      updatedAt: voucher.updatedAt,
      category: voucher.category
        ? {
            id: voucher.category.id,
            name: voucher.category.name,
          }
        : undefined,
      merchant: voucher.merchant
        ? {
            id: voucher.merchant.id,
            businessName: voucher.merchant.businessName,
            logoUrl: voucher.merchant.logoUrl,
            ownerId: voucher.merchant.ownerId,
          }
        : undefined,
    };
  }

  async createVoucher(userId: string, userRole: UserRole, data: unknown) {
    // 1. Role checks (UMKM or ADMIN)
    if (userRole !== UserRole.UMKM && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only users with role UMKM can create vouchers");
    }

    // 2. Must have an approved merchant profile
    const merchant = await merchantRepository.findByOwnerId(userId);
    if (!merchant) {
      throw new ValidationError("You must register as a merchant first");
    }

    if (merchant.status !== "APPROVED") {
      throw new ForbiddenError("Your merchant profile must be approved before listing vouchers");
    }

    // 3. Validate Zod schema
    const parsed = createVoucherSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Invalid voucher data", parsed.error.format() as any);
    }

    const voucher = await voucherRepository.create({
      merchantId: merchant.id,
      ...parsed.data,
      description: parsed.data.description ?? undefined,
      imageUrl: parsed.data.imageUrl ?? undefined,
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
    categoryId?: string;
    merchantId?: string;
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

    // Only merchant owner or ADMIN can update
    const isOwner = voucher.merchant.ownerId === userId;
    if (!isOwner && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only the voucher merchant owner can update this voucher");
    }

    const parsed = updateVoucherSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Invalid update data", parsed.error.format() as any);
    }

    const updated = await voucherRepository.update(id, {
      ...parsed.data,
      description: parsed.data.description ?? undefined,
      imageUrl: parsed.data.imageUrl ?? undefined,
      expiredAt: parsed.data.expiredAt ?? undefined,
    });

    return this.mapVoucher(updated);
  }

  async deleteVoucher(id: string, userId: string, userRole: UserRole) {
    const voucher = await voucherRepository.findById(id);
    if (!voucher) {
      throw new NotFoundError("Voucher not found");
    }

    // Only owner or ADMIN can delete
    const isOwner = voucher.merchant.ownerId === userId;
    if (!isOwner && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only the voucher merchant owner can delete this voucher");
    }

    await voucherRepository.delete(id);
  }
}

export const voucherService = new VoucherService();
