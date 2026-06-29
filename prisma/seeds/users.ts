import bcrypt from "bcrypt";
import { PrismaClient, UserRole } from "@prisma/client";

export async function seedUsers(prisma: PrismaClient) {
  const passwordHash = await bcrypt.hash("User123!", 10);

  // Demo User
  const existingUser = await prisma.user.findUnique({
    where: {
      email: "user@ecolution.id",
    },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        name: "Demo User",
        username: "demo_user",
        email: "user@ecolution.id",
        passwordHash,
        role: UserRole.USER,
        totalPoint: 250,
        trustScore: 85,
        isActive: true,
      },
    });

    console.log("✅ Demo User seeded");
  }

  // Demo Merchant User
  const existingMerchant = await prisma.user.findUnique({
    where: {
      email: "merchant@ecolution.id",
    },
  });

  if (!existingMerchant) {
    await prisma.user.create({
      data: {
        name: "Demo Merchant",
        username: "demo_merchant",
        email: "merchant@ecolution.id",
        passwordHash,
        role: UserRole.UMKM,
        totalPoint: 0,
        trustScore: 100,
        isActive: true,
      },
    });

    console.log("✅ Merchant User seeded");
  }
}