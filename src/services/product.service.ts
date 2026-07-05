import { z } from "zod";
import { productRepository } from "@/repositories/product.repository";
import { merchantRepository } from "@/repositories/merchant.repository";
import { UserRole, ProductStatus } from "@prisma/client";
import {
  ValidationError,
  ForbiddenError,
  NotFoundError,
} from "@/utils/errors";

const createProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters").max(150),
  description: z.string().max(1000).optional().nullable(),
  price: z.preprocess((val) => Number(val), z.number().positive("Price must be greater than 0")),
  stock: z.preprocess((val) => Number(val), z.number().int().nonnegative("Stock cannot be negative")),
  imageThumbnail: z.string().max(255).url("Invalid image thumbnail URL").optional().nullable(),
  images: z.array(z.string().url("Invalid image URL")).optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters").max(150).optional(),
  description: z.string().max(1000).optional().nullable(),
  price: z.preprocess((val) => Number(val), z.number().positive("Price must be greater than 0")).optional(),
  stock: z.preprocess((val) => Number(val), z.number().int().nonnegative("Stock cannot be negative")).optional(),
  imageThumbnail: z.string().max(255).url("Invalid image thumbnail URL").optional().nullable(),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
});

export class ProductService {
  private mapProduct(product: any) {
    return {
      id: product.id,
      merchantId: product.merchantId,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      status: product.status,
      imageThumbnail: product.imageThumbnail,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      images: product.images
        ? product.images.map((img: any) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            createdAt: img.createdAt,
          }))
        : [],
      merchant: product.merchant
        ? {
            id: product.merchant.id,
            businessName: product.merchant.businessName,
            logoUrl: product.merchant.logoUrl,
            status: product.merchant.status,
            ownerId: product.merchant.ownerId,
          }
        : undefined,
    };
  }

  async createProduct(userId: string, userRole: UserRole, data: unknown) {
    // 1. Role must be UMKM or ADMIN
    if (userRole !== UserRole.UMKM && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only users with role UMKM can register products");
    }

    // 2. Must have a registered and APPROVED merchant profile
    const merchant = await merchantRepository.findByOwnerId(userId);
    if (!merchant) {
      throw new ValidationError("You must register as a merchant first");
    }

    if (merchant.status !== "APPROVED") {
      throw new ForbiddenError("Your merchant profile must be approved before you can list products");
    }

    // 3. Validate request data
    const parsed = createProductSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Invalid product data", parsed.error.format() as any);
    }

    // 4. Duplicate name check under same merchant
    const existing = await productRepository.findByNameAndMerchant(merchant.id, parsed.data.name);
    if (existing) {
      throw new ValidationError(`Product name "${parsed.data.name}" already exists under your merchant`);
    }

    const product = await productRepository.create({
      merchantId: merchant.id,
      ...parsed.data,
      description: parsed.data.description ?? undefined,
      imageThumbnail: parsed.data.imageThumbnail ?? undefined,
      images: parsed.data.images || [],
    });

    return this.mapProduct(product);
  }

  async getProduct(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return this.mapProduct(product);
  }

  async listProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    merchantId?: string;
    status?: ProductStatus;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const result = await productRepository.findAll({
      page,
      limit,
      skip,
      ...params,
    });

    return {
      products: result.products.map((p) => this.mapProduct(p)),
      meta: {
        page,
        limit,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / limit),
      },
    };
  }

  async updateProduct(id: string, userId: string, userRole: UserRole, data: unknown) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Only owner merchant or ADMIN can update
    const isOwner = product.merchant.ownerId === userId;
    if (!isOwner && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only the product merchant owner can update this product");
    }

    // Validate data
    const parsed = updateProductSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Invalid update data", parsed.error.format() as any);
    }

    // Name conflict check if name changed
    if (parsed.data.name && parsed.data.name !== product.name) {
      const existing = await productRepository.findByNameAndMerchant(product.merchantId, parsed.data.name);
      if (existing && existing.id !== product.id) {
        throw new ValidationError(`Product name "${parsed.data.name}" already exists under this merchant`);
      }
    }

    const updated = await productRepository.update(id, {
      ...parsed.data,
      description: parsed.data.description ?? undefined,
      imageThumbnail: parsed.data.imageThumbnail ?? undefined,
      images: parsed.data.images,
    });

    return this.mapProduct(updated);
  }

  async deleteProduct(id: string, userId: string, userRole: UserRole) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Only owner merchant or ADMIN can delete
    const isOwner = product.merchant.ownerId === userId;
    if (!isOwner && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only the product merchant owner can delete this product");
    }

    try {
      await productRepository.delete(id);
    } catch (error: any) {
      if (error?.code === "P2003") {
        throw new ValidationError("Cannot delete product because it has associated orders or dependencies");
      }
      throw error;
    }
  }
}

export const productService = new ProductService();
