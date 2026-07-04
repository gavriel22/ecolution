import { prisma } from "@/lib/prisma";
import { Order, OrderStatus } from "@prisma/client";

export class OrderRepository {
  async findById(id: string): Promise<any | null> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                merchant: true,
              },
            },
          },
        },
        user: true,
      },
    });
  }

  async findByUserId(
    userId: string,
    params: { limit: number; skip: number }
  ): Promise<{ orders: any[]; totalCount: number }> {
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  merchant: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);
    return { orders, totalCount };
  }

  async createCheckoutTransaction(
    userId: string,
    itemsInput: { productId: string; quantity: number }[],
    note?: string
  ): Promise<any> {
    return prisma.$transaction(async (tx) => {
      const productIds = itemsInput.map((item) => item.productId);

      // Fetch products to verify existence, status, and stock
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      let totalPrice = 0;
      const orderItemsData = [];

      for (const itemInput of itemsInput) {
        const product = products.find((p) => p.id === itemInput.productId);
        if (!product) {
          throw new Error(`PRODUCT_NOT_FOUND:${itemInput.productId}`);
        }

        if (product.status !== "AVAILABLE") {
          throw new Error(`PRODUCT_UNAVAILABLE:${product.name}`);
        }

        if (product.stock < itemInput.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${product.name} (Stok tersedia: ${product.stock}, Diminta: ${itemInput.quantity})`);
        }

        // Decrement product stock
        const newStock = product.stock - itemInput.quantity;
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: newStock,
            status: newStock === 0 ? "OUT_OF_STOCK" : undefined,
          },
        });

        const itemPrice = Number(product.price);
        totalPrice += itemPrice * itemInput.quantity;

        orderItemsData.push({
          productId: product.id,
          quantity: itemInput.quantity,
          price: itemPrice,
        });
      }

      // Generate order number ECO-YYYYMMDD-XXXXXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomStr = Math.floor(100000 + Math.random() * 900000);
      const orderNumber = `ECO-${dateStr}-${randomStr}`;

      // Create Order and nested OrderItems
      return tx.order.create({
        data: {
          userId,
          totalPrice,
          orderNumber,
          note: note || null,
          status: OrderStatus.PENDING,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  merchant: true,
                },
              },
            },
          },
        },
      });
    });
  }
}

export const orderRepository = new OrderRepository();
