import { PrismaClient } from "@prisma/client";

import { seedAdmin } from "./seeds/admin";
import { seedUsers } from "./seeds/users";
import { seedActivityCategories } from "./seeds/activity-category";
import { seedChallengeCategories } from "./seeds/challenge-category";
import { seedVoucherCategories } from "./seeds/voucher-category";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  await seedAdmin(prisma);
  await seedUsers(prisma);

  await seedActivityCategories(prisma);
  await seedChallengeCategories(prisma);
  await seedVoucherCategories(prisma);

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