import { prisma } from "@/lib/prisma";
import { VoucherRedemption, RedemptionStatus, VoucherStatus } from "@prisma/client";

export class VoucherRedemptionRepository {
  async findById(id: string): Promise<any | null> {
    return prisma.voucherRedemption.findUnique({
      where: { id },
      include: {
        user: true,
        voucher: true,
      },
    });
  }

  async findByUserId(
    userId: string,
    params: { limit: number; skip: number }
  ): Promise<{ redemptions: any[]; totalCount: number }> {
    const [redemptions, totalCount] = await Promise.all([
      prisma.voucherRedemption.findMany({
        where: { userId },
        include: {
          voucher: true,
        },
        orderBy: { redeemedAt: "desc" },
        skip: params.skip,
        take: params.limit,
      }),
      prisma.voucherRedemption.count({ where: { userId } }),
    ]);

    return { redemptions, totalCount };
  }

  async createRedemptionTransaction(userId: string, voucherId: string): Promise<any> {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch user data (locks row for update in PG to prevent double spending points)
      const user = await tx.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new Error(`USER_NOT_FOUND:${userId}`);
      }

      // 2. Fetch voucher data
      const voucher = await tx.voucher.findUnique({
        where: { id: voucherId },
      });
      if (!voucher) {
        throw new Error(`VOUCHER_NOT_FOUND:${voucherId}`);
      }

      // 3. Check if user already redeemed this voucher
      const existingRedemption = await tx.voucherRedemption.findUnique({
        where: {
          voucherId_userId: {
            voucherId,
            userId,
          },
        },
      });
      if (existingRedemption) {
        throw new Error(`ALREADY_REDEEMED:${voucher.title}`);
      }

      // 4. Validate voucher status, expiry, and stock
      if (voucher.status !== VoucherStatus.AVAILABLE || voucher.stock <= 0) {
        throw new Error(`VOUCHER_OUT_OF_STOCK:${voucher.title}`);
      }

      if (voucher.expiredAt && new Date(voucher.expiredAt) < new Date()) {
        throw new Error(`VOUCHER_EXPIRED:${voucher.title}`);
      }

      // 5. Validate user points balance
      if (user.totalPoint < voucher.pointCost) {
        throw new Error(`INSUFFICIENT_POINTS:${voucher.title} (Membutuhkan: ${voucher.pointCost}, Saldo Anda: ${user.totalPoint})`);
      }

      // 6. Deduct user points
      const newUserPoints = user.totalPoint - voucher.pointCost;
      await tx.user.update({
        where: { id: userId },
        data: {
          totalPoint: newUserPoints,
        },
      });

      // 7. Decrement voucher stock
      const newStock = voucher.stock - 1;
      await tx.voucher.update({
        where: { id: voucherId },
        data: {
          stock: newStock,
          status: newStock === 0 ? VoucherStatus.OUT_OF_STOCK : undefined,
        },
      });

      // 8. Log Point History
      await tx.pointHistory.create({
        data: {
          userId,
          point: voucher.pointCost,
          type: "REDEEM",
          description: `Penukaran Voucher: ${voucher.title}`,
        },
      });

      // 9. Generate unique voucher code: VCH-XXXXXXXX (8 random capital characters/numbers)
      const allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let randomCode = "";
      for (let i = 0; i < 8; i++) {
        randomCode += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
      }
      const voucherCode = `VCH-${randomCode}`;

      // 10. Save redemption entry
      return tx.voucherRedemption.create({
        data: {
          voucherId,
          userId,
          voucherCode,
          status: RedemptionStatus.COMPLETED,
          redeemedAt: new Date(),
          completedAt: new Date(),
        },
        include: {
          voucher: true,
        },
      });
    });
  }
}

export const voucherRedemptionRepository = new VoucherRedemptionRepository();
