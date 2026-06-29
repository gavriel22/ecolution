import bcrypt from "bcrypt";
import { PrismaClient, UserRole } from "@prisma/client";

export async function seedAdmin(prisma: PrismaClient) {
  const existing = await prisma.user.findUnique({
    where: {
      email: "admin@ecolution.id",
    },
  });

  if (existing) return;

  const passwordHash = await bcrypt.hash("Admin123!", 10);

  await prisma.user.create({
    data: {
      name: "Administrator",
      username: "admin",
      email: "admin@ecolution.id",
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log("✅ Admin seeded");
}