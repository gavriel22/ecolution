import { PrismaClient } from "@prisma/client";

export async function seedVoucherCategories(prisma: PrismaClient) {
  const categories = [
    {
      name: "Coffee",
      description: "Voucher untuk minuman kopi.",
    },
    {
      name: "Food",
      description: "Voucher makanan dan minuman.",
    },
    {
      name: "Shopping",
      description: "Voucher belanja.",
    },
    {
      name: "Education",
      description: "Voucher pendidikan.",
    },
    {
      name: "Transportation",
      description: "Voucher transportasi.",
    },
  ];

  for (const category of categories) {
    await prisma.voucherCategory.upsert({
      where: {
        name: category.name,
      },
      update: {},
      create: category,
    });
  }

  console.log("✅ Voucher Categories seeded");
}