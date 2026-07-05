import {
  PrismaClient,
  UserRole,
  MerchantStatus,
} from "@prisma/client";

import bcrypt from "bcryptjs";

export async function seedMerchants(prisma: PrismaClient) {
  const password = await bcrypt.hash("merchant123", 10);

  const merchantUser = await prisma.user.upsert({
    where: {
      email: "merchant@ecolution.id",
    },
    update: {
      name: "Eco Merchant",
      username: "ecomerchant",
      role: UserRole.UMKM,
      trustScore: 100,
      isActive: true,
    },
    create: {
      name: "Eco Merchant",
      username: "ecomerchant",
      email: "merchant@ecolution.id",
      passwordHash: password,
      role: UserRole.UMKM,
      trustScore: 100,
      isActive: true,
    },
  });

  await prisma.merchant.upsert({
    where: {
      ownerId: merchantUser.id,
    },
    update: {
      businessName: "Eco Store Indonesia",
      description: "Menjual berbagai produk ramah lingkungan.",
      phone: "081234567890",
      address: "Jakarta Selatan",
      logoUrl: "/merchant/logo.png",
      email: "merchant@ecolution.id",
      website: "https://ecostore.id",
      status: MerchantStatus.APPROVED,
    },
    create: {
      ownerId: merchantUser.id,
      businessName: "Eco Store Indonesia",
      description: "Menjual berbagai produk ramah lingkungan.",
      phone: "081234567890",
      address: "Jakarta Selatan",
      logoUrl: "/merchant/logo.png",
      email: "merchant@ecolution.id",
      website: "https://ecostore.id",
      status: MerchantStatus.APPROVED,
    },
  });

  console.log("✅ Merchants seeded");
}