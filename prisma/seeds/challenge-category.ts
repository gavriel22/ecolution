import { PrismaClient } from "@prisma/client";

export async function seedChallengeCategories(prisma: PrismaClient) {
  const categories = [
    {
      name: "Harian",
      description: "Challenge yang berlangsung setiap hari.",
    },
    {
      name: "Mingguan",
      description: "Challenge yang berlangsung setiap minggu.",
    },
    {
      name: "Bulanan",
      description: "Challenge yang berlangsung setiap bulan.",
    },
  ];

  for (const category of categories) {
    await prisma.challengeCategory.upsert({
      where: {
        name: category.name,
      },
      update: {},
      create: category,
    });
  }

  console.log("✅ Challenge Categories seeded");
}