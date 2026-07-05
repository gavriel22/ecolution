import { z } from "zod";
import { merchantRepository } from "@/repositories/merchant.repository";
import { UserRole, MerchantStatus } from "@prisma/client";
import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "@/utils/errors";

const createMerchantSchema = z.object({
  businessName: z.string().min(3, "Business name must be at least 3 characters").max(150),
  description: z.string().max(1000).optional().nullable(),
  logoUrl: z.string().max(255).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.preprocess((val) => (val === "" ? undefined : val), z.string().email("Invalid email format").optional().nullable()),
  website: z.preprocess((val) => (val === "" ? undefined : val), z.string().url("Invalid website URL format").optional().nullable()),
  category: z.string().max(100).optional().nullable(),
  operasionalHours: z.string().max(100).optional().nullable(),
});

const updateMerchantSchema = z.object({
  businessName: z.string().min(3, "Business name must be at least 3 characters").max(150).optional(),
  description: z.string().max(1000).optional().nullable(),
  logoUrl: z.string().max(255).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.preprocess((val) => (val === "" ? undefined : val), z.string().email("Invalid email format").optional().nullable()),
  website: z.preprocess((val) => (val === "" ? undefined : val), z.string().url("Invalid website URL format").optional().nullable()),
  category: z.string().max(100).optional().nullable(),
  operasionalHours: z.string().max(100).optional().nullable(),
});

export class MerchantService {
  private mapMerchant(merchant: any, adminId?: string) {
    return {
      id: merchant.id,
      ownerId: merchant.ownerId,
      businessName: merchant.businessName,
      description: merchant.description,
      logoUrl: merchant.logoUrl,
      address: merchant.address,
      phone: merchant.phone,
      email: merchant.email,
      website: merchant.website,
      category: merchant.category,
      operasionalHours: merchant.operasionalHours,
      status: merchant.status,
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt,
      isApproved: merchant.status === MerchantStatus.APPROVED,
      approvedAt: merchant.status === MerchantStatus.APPROVED ? merchant.updatedAt : null,
      approvedBy: merchant.status === MerchantStatus.APPROVED ? (adminId || "ADMIN") : null,
      owner: merchant.owner ? {
        id: merchant.owner.id,
        name: merchant.owner.name,
        username: merchant.owner.username,
        email: merchant.owner.email,
        role: merchant.owner.role,
      } : undefined,
    };
  }

  async createMerchant(userId: string, userRole: UserRole, data: unknown) {
    // 1. Role harus USER atau UMKM atau ADMIN (jika mendaftar mode admin)
    if (userRole !== UserRole.USER && userRole !== UserRole.UMKM && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only users with role USER or UMKM can register as a merchant");
    }

    // 2. Validasi input data
    const parsed = createMerchantSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Invalid merchant data", parsed.error.format() as any);
    }

    // 3. User hanya boleh memiliki satu Merchant
    const existing = await merchantRepository.findByOwnerId(userId);
    if (existing) {
      throw new ValidationError("User is already registered as a merchant");
    }

    const merchant = await merchantRepository.create({
      ownerId: userId,
      ...parsed.data,
      description: parsed.data.description ?? undefined,
      logoUrl: parsed.data.logoUrl ?? undefined,
      address: parsed.data.address ?? undefined,
      phone: parsed.data.phone ?? undefined,
      email: parsed.data.email ?? undefined,
      website: parsed.data.website ?? undefined,
      category: parsed.data.category ?? undefined,
      operasionalHours: parsed.data.operasionalHours ?? undefined,
    });

    return this.mapMerchant(merchant);
  }

  async getMerchant(id: string, userId: string, userRole: UserRole) {
    const merchant = await merchantRepository.findById(id);
    if (!merchant) {
      throw new NotFoundError("Merchant not found");
    }

    // User biasa hanya melihat merchant yang approved (kecuali dia owner atau admin)
    if (userRole !== UserRole.ADMIN && merchant.ownerId !== userId && merchant.status !== MerchantStatus.APPROVED) {
      throw new ForbiddenError("You do not have permission to view this pending/suspended merchant");
    }

    return this.mapMerchant(merchant);
  }

  async listMerchants(userId: string, userRole: UserRole) {
    let merchants: any[];

    // Admin dapat melihat seluruh merchant, user biasa hanya approved merchant
    if (userRole === UserRole.ADMIN) {
      merchants = await merchantRepository.findAll();
    } else {
      merchants = await merchantRepository.findAllApproved();
    }

    return merchants.map((m) => this.mapMerchant(m));
  }

  async updateMerchant(id: string, userId: string, userRole: UserRole, data: unknown) {
    const parsed = updateMerchantSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Invalid update data", parsed.error.format() as any);
    }

    const merchant = await merchantRepository.findById(id);
    if (!merchant) {
      throw new NotFoundError("Merchant not found");
    }

    // Hanya owner merchant atau admin yang boleh mengubah data
    if (merchant.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only the merchant owner can update this profile");
    }

    const updated = await merchantRepository.update(id, {
      ...parsed.data,
      description: parsed.data.description ?? undefined,
      logoUrl: parsed.data.logoUrl ?? undefined,
      address: parsed.data.address ?? undefined,
      phone: parsed.data.phone ?? undefined,
      email: parsed.data.email ?? undefined,
      website: parsed.data.website ?? undefined,
      category: parsed.data.category ?? undefined,
      operasionalHours: parsed.data.operasionalHours ?? undefined,
    });

    return this.mapMerchant(updated);
  }

  async deleteMerchant(id: string, userId: string, userRole: UserRole) {
    const merchant = await merchantRepository.findById(id);
    if (!merchant) {
      throw new NotFoundError("Merchant not found");
    }

    // Hanya owner merchant yang boleh menghapus
    if (merchant.ownerId !== userId) {
      throw new ForbiddenError("Only the merchant owner can delete this merchant");
    }

    // Tidak boleh menghapus merchant yang sudah mempunyai Product
    if (merchant.products && merchant.products.length > 0) {
      throw new ValidationError("Cannot delete a merchant that has listed products in the marketplace");
    }

    await merchantRepository.delete(id);
  }

  async approveMerchant(id: string, adminId: string, userRole: UserRole) {
    // Admin Only
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only administrators can approve merchants");
    }

    const merchant = await merchantRepository.findById(id);
    if (!merchant) {
      throw new NotFoundError("Merchant not found");
    }

    if (merchant.status === MerchantStatus.APPROVED) {
      throw new ValidationError("Merchant is already approved");
    }

    const approvedMerchant = await merchantRepository.approve(id, adminId);
    return this.mapMerchant(approvedMerchant, adminId);
  }
}

export const merchantService = new MerchantService();
