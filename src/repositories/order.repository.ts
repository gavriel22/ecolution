import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

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
        voucherRedemption: {
          include: {
            voucher: true,
          },
        },
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
          voucherRedemption: {
            include: {
              voucher: true,
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
    note?: string,
    voucherRedemptionId?: string
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

      // Handle voucher discount
      let discountAmount = 0;
      let finalPrice = totalPrice;

      if (voucherRedemptionId) {
        // Fetch and validate the voucher redemption
        const redemption = await tx.voucherRedemption.findUnique({
          where: { id: voucherRedemptionId },
          include: { voucher: true },
        });

        if (!redemption || redemption.userId !== userId) {
          throw new Error("VOUCHER_REDEMPTION_NOT_FOUND");
        }

        if (redemption.status !== "COMPLETED" || redemption.usedAt !== null) {
          throw new Error("VOUCHER_REDEMPTION_NOT_FOUND");
        }

        discountAmount = redemption.voucher.discountAmount;
        finalPrice = Math.max(0, totalPrice - discountAmount);
      }

      // Generate order number ECO-YYYYMMDD-XXXXXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomStr = Math.floor(100000 + Math.random() * 900000);
      const orderNumber = `ECO-${dateStr}-${randomStr}`;

      // Create Order and nested OrderItems
      const order = await tx.order.create({
        data: {
          userId,
          totalPrice,
          discountAmount,
          finalPrice,
          orderNumber,
          note: note || null,
          status: OrderStatus.PROCESSING,
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
          voucherRedemption: {
            include: { voucher: true },
          },
        },
      });

      // If voucher was used, mark it as USED and link to the order
      if (voucherRedemptionId) {
        await tx.voucherRedemption.update({
          where: { id: voucherRedemptionId },
          data: {
            status: "USED",
            usedAt: new Date(),
            usedInOrderId: order.id,
          },
        });
      }

      return order;
    });
  }
}

export const orderRepository = new OrderRepository();
