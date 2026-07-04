import { prisma } from "@/lib/prisma";
import { Voucher, VoucherStatus, Prisma } from "@prisma/client";

export class VoucherRepository {
  async findById(id: string): Promise<any | null> {
    return prisma.voucher.findUnique({
      where: { id },
      include: {
        category: true,
        merchant: {
          include: {
            owner: true,
          },
        },
      },
    });
  }

  async create(data: {
    merchantId: string;
    categoryId: string;
    title: string;
    description?: string | null;
    pointCost: number;
    stock: number;
    imageUrl?: string | null;
    expiredAt?: Date | null;
    status?: VoucherStatus;
  }): Promise<any> {
    return prisma.voucher.create({
      data: {
        merchantId: data.merchantId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        pointCost: data.pointCost,
        stock: data.stock,
        imageUrl: data.imageUrl,
        expiredAt: data.expiredAt,
        status: data.status || VoucherStatus.AVAILABLE,
      },
      include: {
        category: true,
        merchant: true,
      },
    });
  }

  async update(
    id: string,
    data: {
      categoryId?: string;
      title?: string;
      description?: string | null;
      pointCost?: number;
      stock?: number;
      imageUrl?: string | null;
      expiredAt?: Date | null;
      status?: VoucherStatus;
    }
  ): Promise<any> {
    return prisma.voucher.update({
      where: { id },
      data,
      include: {
        category: true,
        merchant: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.voucher.delete({
      where: { id },
    });
  }

  async findAll(params: {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    categoryId?: string;
    merchantId?: string;
    status?: VoucherStatus;
    minPointCost?: number;
    maxPointCost?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ vouchers: any[]; totalCount: number }> {
    const where: Prisma.VoucherWhereInput = {};

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.merchantId) {
      where.merchantId = params.merchantId;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.minPointCost !== undefined || params.maxPointCost !== undefined) {
      where.pointCost = {};
      if (params.minPointCost !== undefined) {
        where.pointCost.gte = params.minPointCost;
      }
      if (params.maxPointCost !== undefined) {
        where.pointCost.lte = params.maxPointCost;
      }
    }

    const orderBy: any = {};
    if (params.sortBy) {
      orderBy[params.sortBy] = params.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [vouchers, totalCount] = await Promise.all([
      prisma.voucher.findMany({
        where,
        include: {
          category: true,
          merchant: true,
        },
        orderBy,
        skip: params.skip,
        take: params.limit,
      }),
      prisma.voucher.count({ where }),
    ]);

    return { vouchers, totalCount };
  }
}

export const voucherRepository = new VoucherRepository();
