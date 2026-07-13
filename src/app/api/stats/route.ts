import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/response";

export async function GET(req: NextRequest) {
  try {
    const [
      totalUsers,
      totalMerchants,
      totalVerifiedActivities,
      totalRewardsRedeemed,
    ] = await Promise.all([
      // 1. Anggota Komunitas
      prisma.user.count({
        where: {
          deletedAt: null,
          role: "USER",
        },
      }),
      // 2. Mitra UMKM
      prisma.merchant.count(),
      // 3. Aksi Lingkungan Terverifikasi
      prisma.activity.count({
        where: {
          status: "APPROVED",
        },
      }),
      // 4. Reward telah dibagikan
      prisma.voucherRedemption.count({
        where: {
          status: {
            in: ["APPROVED", "COMPLETED", "USED"],
          },
        },
      }),
    ]);

    // 5. Calculate recycled waste in tons (e.g. 50 kg / 0.05 tons per approved activity)
    const totalRecycledWaste = totalVerifiedActivities * 0.05;

    return successResponse({
      totalUsers,
      totalMerchants,
      totalVerifiedActivities,
      totalRecycledWaste,
      totalRewardsRedeemed,
    }, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
