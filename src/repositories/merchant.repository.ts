import { prisma } from "@/lib/prisma";
import { Merchant, MerchantStatus, UserRole } from "@prisma/client";

export class MerchantRepository {
  async findById(id: string): Promise<any | null> {
    return prisma.merchant.findUnique({
      where: { id },
      include: {
        products: true,
        owner: true,
      },
    });
  }

  async findByOwnerId(ownerId: string): Promise<Merchant | null> {
    return prisma.merchant.findUnique({
      where: { ownerId },
    });
  }

  async create(data: {
    ownerId: string;
    businessName: string;
    description?: string;
    logoUrl?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    category?: string;
    operasionalHours?: string;
  }): Promise<Merchant> {
    return prisma.merchant.create({
      data: {
        ownerId: data.ownerId,
        businessName: data.businessName,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        category: data.category || null,
        operasionalHours: data.operasionalHours || null,
        status: MerchantStatus.PENDING,
      },
    });
  }

  async update(
    id: string,
    data: {
      businessName?: string;
      description?: string;
      logoUrl?: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      category?: string;
      operasionalHours?: string;
    }
  ): Promise<Merchant> {
    return prisma.merchant.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.merchant.delete({
      where: { id },
    });
  }

  async findAll(): Promise<any[]> {
    return prisma.merchant.findMany({
      include: {
        owner: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findAllApproved(): Promise<any[]> {
    return prisma.merchant.findMany({
      where: {
        status: MerchantStatus.APPROVED,
      },
      include: {
        owner: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async approve(id: string, adminId: string): Promise<any> {
    return prisma.$transaction(async (tx) => {
      const merchant = await tx.merchant.findUnique({
        where: { id },
        include: { owner: true },
      });

      if (!merchant) {
        return null;
      }

      // Update merchant status to APPROVED
      const updatedMerchant = await tx.merchant.update({
        where: { id },
        data: {
          status: MerchantStatus.APPROVED,
        },
        include: {
          owner: true,
        },
      });

      // Update owner user role if it was USER
      if (merchant.owner.role === UserRole.USER) {
        const updatedUser = await tx.user.update({
          where: { id: merchant.ownerId },
          data: {
            role: UserRole.UMKM,
          },
        });
        updatedMerchant.owner = updatedUser;
      }

      return updatedMerchant;
    });
  }
}

export const merchantRepository = new MerchantRepository();
