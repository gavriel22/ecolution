import { prisma } from "@/lib/prisma";
import { Product, ProductStatus, Prisma } from "@prisma/client";

export class ProductRepository {
  async findById(id: string): Promise<any | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        merchant: {
          include: {
            owner: true,
          },
        },
      },
    });
  }

  async findByNameAndMerchant(merchantId: string, name: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: {
        merchantId_name: {
          merchantId,
          name,
        },
      },
    });
  }

  async create(data: {
    merchantId: string;
    name: string;
    description?: string | null;
    price: number | Prisma.Decimal;
    stock: number;
    imageThumbnail?: string | null;
    status?: ProductStatus;
    images?: string[];
  }): Promise<any> {
    return prisma.product.create({
      data: {
        merchantId: data.merchantId,
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        status: data.status || ProductStatus.AVAILABLE,
        imageThumbnail: data.imageThumbnail,
        images: data.images && data.images.length > 0
          ? {
              create: data.images.map((url) => ({ imageUrl: url })),
            }
          : undefined,
      },
      include: {
        images: true,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      price?: number | Prisma.Decimal;
      stock?: number;
      imageThumbnail?: string | null;
      status?: ProductStatus;
      images?: string[];
    }
  ): Promise<any> {
    const updateData: any = {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      status: data.status,
      imageThumbnail: data.imageThumbnail,
    };

    if (data.images !== undefined) {
      updateData.images = {
        deleteMany: {},
        create: data.images.map((url) => ({ imageUrl: url })),
      };
    }

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id },
    });
  }

  async findAll(params: {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    merchantId?: string;
    status?: ProductStatus;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ products: any[]; totalCount: number }> {
    const where: Prisma.ProductWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.merchantId) {
      where.merchantId = params.merchantId;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.price = {};
      if (params.minPrice !== undefined) {
        where.price.gte = params.minPrice;
      }
      if (params.maxPrice !== undefined) {
        where.price.lte = params.maxPrice;
      }
    }

    const orderBy: any = {};
    if (params.sortBy) {
      orderBy[params.sortBy] = params.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: true,
          merchant: true,
        },
        orderBy,
        skip: params.skip,
        take: params.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, totalCount };
  }
}

export const productRepository = new ProductRepository();
