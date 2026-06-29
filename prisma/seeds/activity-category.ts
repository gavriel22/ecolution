import { PrismaClient } from "@prisma/client";

export async function seedActivityCategories(prisma: PrismaClient) {
  const categories = [
    {
      name: "Menanam Pohon",
      description: "Kegiatan penanaman pohon untuk penghijauan.",
      pointReward: 100,
    },
    {
      name: "Daur Ulang",
      description: "Mengolah kembali sampah menjadi barang bermanfaat.",
      pointReward: 80,
    },
    {
      name: "Kompos",
      description: "Mengolah sampah organik menjadi kompos.",
      pointReward: 70,
    },
    {
      name: "Bersih Pantai",
      description: "Membersihkan sampah di area pantai.",
      pointReward: 120,
    },
    {
      name: "Transportasi Hijau",
      description: "Menggunakan transportasi ramah lingkungan.",
      pointReward: 50,
    },
    {
      name: "Hemat Energi",
      description: "Melakukan aksi penghematan energi.",
      pointReward: 60,
    },
  ];

  for (const category of categories) {
    await prisma.activityCategory.upsert({
      where: {
        name: category.name,
      },
      update: {
        description: category.description,
        pointReward: category.pointReward,
      },
      create: category,
    });
  }

  console.log("✅ Activity Categories seeded");
}