import { PrismaClient } from "@prisma/client";

import { seedAdmin } from "./seeds/admin";
import { seedUsers } from "./seeds/users";
import { seedActivityCategories } from "./seeds/activity-category";
import { seedChallengeCategories } from "./seeds/challenge-category";
import { seedMerchants } from "./seeds/merchant";
import { seedProducts } from "./seeds/product";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  await seedAdmin(prisma);
  await seedUsers(prisma);

  await seedActivityCategories(prisma);
  await seedChallengeCategories(prisma);
  
  await seedMerchants(prisma);
  await seedProducts(prisma);

  console.log("✅ Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });