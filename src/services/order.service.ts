import { z } from "zod";
import { orderRepository } from "@/repositories/order.repository";
import { UserRole, OrderStatus } from "@prisma/client";
import {
  ValidationError,
  ForbiddenError,
  NotFoundError,
} from "@/utils/errors";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid("Invalid product ID format"),
        quantity: z.number().int().positive("Quantity must be at least 1"),
      })
    )
    .nonempty("Order must contain at least one item"),
  note: z.string().max(500).optional().nullable(),
  voucherRedemptionId: z.string().uuid("Invalid voucher redemption ID format").optional().nullable(),
});


export class OrderService {
  private mapOrder(order: any) {
    return {
      id: order.id,
      userId: order.userId,
      totalPrice: Number(order.totalPrice),
      discountAmount: Number(order.discountAmount),
      finalPrice: Number(order.finalPrice),
      status: order.status,
      note: order.note,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: order.user
        ? {
            id: order.user.id,
            name: order.user.name,
            username: order.user.username,
            email: order.user.email,
          }
        : undefined,
      items: order.items
        ? order.items.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: Number(item.price),
            product: item.product
              ? {
                  id: item.product.id,
                  name: item.product.name,
                  imageThumbnail: item.product.imageThumbnail,
                  merchant: item.product.merchant
                    ? {
                        id: item.product.merchant.id,
                        businessName: item.product.merchant.businessName,
                      }
                    : undefined,
                }
              : undefined,
          }))
        : [],
    };
  }

  async createOrder(userId: string, data: unknown) {
    // Validate checkout request body
    const parsed = checkoutSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Invalid checkout data", parsed.error.format() as any);
    }

    try {
      const order = await orderRepository.createCheckoutTransaction(
        userId,
        parsed.data.items,
        parsed.data.note || undefined,
        parsed.data.voucherRedemptionId || undefined
      );

      return this.mapOrder(order);
    } catch (e: any) {
      const message = e.message || "";
      if (message.startsWith("PRODUCT_NOT_FOUND:")) {
        const id = message.split(":")[1];
        throw new NotFoundError(`Product with ID ${id} not found`);
      }
      if (message.startsWith("PRODUCT_UNAVAILABLE:")) {
        const name = message.split(":")[1];
        throw new ValidationError(`Product "${name}" is no longer available`);
      }
      if (message.startsWith("INSUFFICIENT_STOCK:")) {
        const detail = message.split(":")[1];
        throw new ValidationError(`Insufficient stock: ${detail}`);
      }
      if (message.startsWith("VOUCHER_REDEMPTION_NOT_FOUND")) {
        throw new NotFoundError("Voucher redemption not found or already used");
      }
      throw e;
    }
  }

  async getOrder(id: string, userId: string, userRole: UserRole) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Only order owner or ADMIN can view
    if (order.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("You do not have permission to view this order");
    }

    return this.mapOrder(order);
  }

  async listUserOrders(userId: string, params: { page?: number; limit?: number }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const result = await orderRepository.findByUserId(userId, { limit, skip });

    return {
      orders: result.orders.map((o) => this.mapOrder(o)),
      meta: {
        page,
        limit,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / limit),
      },
    };
  }
}

export const orderService = new OrderService();
