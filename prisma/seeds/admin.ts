import bcrypt from "bcrypt";
import { PrismaClient, UserRole } from "@prisma/client";

export async function seedAdmin(prisma: PrismaClient) {
  const passwordHash = await bcrypt.hash("Admin123!", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@ecolution.id",
    },
    update: {
      name: "Administrator",
      username: "admin",
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
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