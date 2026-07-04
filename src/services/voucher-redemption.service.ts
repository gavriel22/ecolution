import { z } from "zod";
import { voucherRedemptionRepository } from "@/repositories/voucher-redemption.repository";
import {
  ValidationError,
  NotFoundError,
} from "@/utils/errors";

const redeemVoucherSchema = z.object({
  voucherId: z.string().uuid("Invalid voucher ID format"),
});

export class VoucherRedemptionService {
  private mapRedemption(redemption: any) {
    return {
      id: redemption.id,
      voucherId: redemption.voucherId,
      userId: redemption.userId,
      voucherCode: redemption.voucherCode,
      status: redemption.status,
      redeemedAt: redemption.redeemedAt,
      completedAt: redemption.completedAt,
      voucher: redemption.voucher
        ? {
            id: redemption.voucher.id,
            title: redemption.voucher.title,
            pointCost: redemption.voucher.pointCost,
            imageUrl: redemption.voucher.imageUrl,
            merchant: redemption.voucher.merchant
              ? {
                  id: redemption.voucher.merchant.id,
                  businessName: redemption.voucher.merchant.businessName,
                }
              : undefined,
          }
        : undefined,
    };
  }

  async redeemVoucher(userId: string, data: unknown) {
    const parsed = redeemVoucherSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Invalid redemption request", parsed.error.format() as any);
    }

    try {
      const redemption = await voucherRedemptionRepository.createRedemptionTransaction(
        userId,
        parsed.data.voucherId
      );

      return this.mapRedemption(redemption);
    } catch (e: any) {
      const message = e.message || "";
      if (message.startsWith("USER_NOT_FOUND:")) {
        throw new NotFoundError("User not found");
      }
      if (message.startsWith("VOUCHER_NOT_FOUND:")) {
        throw new NotFoundError("Voucher not found or does not exist");
      }
      if (message.startsWith("ALREADY_REDEEMED:")) {
        const title = message.split(":")[1];
        throw new ValidationError(`You have already redeemed the voucher: "${title}"`);
      }
      if (message.startsWith("VOUCHER_OUT_OF_STOCK:")) {
        const title = message.split(":")[1];
        throw new ValidationError(`Voucher "${title}" is currently out of stock`);
      }
      if (message.startsWith("VOUCHER_EXPIRED:")) {
        const title = message.split(":")[1];
        throw new ValidationError(`Voucher "${title}" has expired`);
      }
      if (message.startsWith("INSUFFICIENT_POINTS:")) {
        const detail = message.split(":")[1];
        throw new ValidationError(`Insufficient points: ${detail}`);
      }
      throw e;
    }
  }

  async listUserRedemptions(userId: string, params: { page?: number; limit?: number }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const result = await voucherRedemptionRepository.findByUserId(userId, { limit, skip });

    return {
      redemptions: result.redemptions.map((r) => this.mapRedemption(r)),
      meta: {
        page,
        limit,
        totalCount: result.totalCount,
        totalPages: Math.ceil(result.totalCount / limit),
      },
    };
  }
}

export const voucherRedemptionService = new VoucherRedemptionService();
