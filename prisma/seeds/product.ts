import { PrismaClient, ProductStatus } from "@prisma/client";

export async function seedProducts(prisma: PrismaClient) {
  const merchant = await prisma.merchant.findFirst();

  if (!merchant) {
    console.log("Merchant belum ada.");
    return;
  }

  const products = [
    {
      name: "Tumbler Stainless Eco",
      description: "Tumbler ramah lingkungan 500ml.",
      price: 85000,
      stock: 100,
      status: ProductStatus.AVAILABLE,
      merchantId: merchant.id,
    },
    {
      name: "Tas Belanja Kanvas",
      description: "Reusable shopping bag.",
      price: 35000,
      stock: 80,
      status: ProductStatus.AVAILABLE,
      merchantId: merchant.id,
    },
    {
      name: "Sedotan Stainless",
      description: "Sedotan reusable.",
      price: 25000,
      stock: 120,
      status: ProductStatus.AVAILABLE,
      merchantId: merchant.id,
    },
    {
      name: "Sikat Gigi Bamboo",
      description: "Eco friendly bamboo toothbrush.",
      price: 18000,
      stock: 150,
      status: ProductStatus.AVAILABLE,
      merchantId: merchant.id,
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        merchantId_name: {
          name: product.name,
          merchantId: merchant.id,
        },
      },
      update: {
        description: product.description,
        price: product.price,
        stock: product.stock,
        status: product.status,
      },
      create: product,
    });
  }

  console.log("✅ Products seeded");
}