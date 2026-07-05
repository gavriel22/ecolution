import { prisma } from "@/lib/prisma";
import { VoucherStatus, Prisma } from "@prisma/client";

export class VoucherRepository {
  async findById(id: string): Promise<any | null> {
    return prisma.voucher.findUnique({
      where: { id },
    });
  }

  async create(data: {
    title: string;
    description?: string | null;
    pointCost: number;
    discountAmount: number;
    stock: number;
    expiredAt?: Date | null;
    status?: VoucherStatus;
  }): Promise<any> {
    return prisma.voucher.create({
      data: {
        title: data.title,
        description: data.description,
        pointCost: data.pointCost,
        discountAmount: data.discountAmount,
        stock: data.stock,
        expiredAt: data.expiredAt,
        status: data.status || VoucherStatus.AVAILABLE,
      },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      pointCost?: number;
      discountAmount?: number;
      stock?: number;
      expiredAt?: Date | null;
      status?: VoucherStatus;
    }
  ): Promise<any> {
    return prisma.voucher.update({
      where: { id },
      data,
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
        orderBy: { [params.sortBy || "createdAt"]: params.sortOrder || "desc" },
        skip: params.skip,
        take: params.limit,
      }),
      prisma.voucher.count({ where }),
    ]);

    return { vouchers, totalCount };
  }
}

export const voucherRepository = new VoucherRepository();
