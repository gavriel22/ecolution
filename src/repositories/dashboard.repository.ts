import { prisma } from "@/lib/prisma";
import { ActivityStatus, OrderStatus, PointTransactionType } from "@prisma/client";

export class DashboardRepository {
  async getAdminMetrics(): Promise<any> {
    const [
      totalUsers,
      totalMerchants,
      activitiesGrouped,
      pointsAggregate,
      topUsers,
    ] = await Promise.all([
      prisma.user.count({
        where: { deletedAt: null },
      }),
      prisma.merchant.count(),
      prisma.activity.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
      }),
      prisma.user.aggregate({
        _sum: {
          totalPoint: true,
        },
      }),
      prisma.user.findMany({
        where: {
          deletedAt: null,
          role: "USER",
        },
        orderBy: {
          totalPoint: "desc",
        },
        take: 5,
        select: {
          id: true,
          name: true,
          username: true,
          totalPoint: true,
          trustScore: true,
        },
      }),
    ]);

    // Format activities count
    const activitiesCount = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      TOTAL: 0,
    };

    activitiesGrouped.forEach((group) => {
      const status = group.status as ActivityStatus;
      const count = group._count.id;
      activitiesCount[status] = count;
      activitiesCount.TOTAL += count;
    });

    return {
      totalUsers,
      totalMerchants,
      activitiesCount,
      totalPointsCirculation: pointsAggregate._sum.totalPoint || 0,
      topUsers,
    };
  }

  async getUserMetrics(userId: string): Promise<any> {
    const [
      user,
      activitiesGrouped,
      activeChallengesCount,
      recentPoints,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          totalPoint: true,
          trustScore: true,
        },
      }),
      prisma.activity.groupBy({
        where: { userId },
        by: ["status"],
        _count: {
          id: true,
        },
      }),
      prisma.challengeParticipant.count({
        where: {
          userId,
          status: "JOINED",
        },
      }),
      prisma.pointHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    if (!user) return null;

    // Format user activities count
    const activitiesCount = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      TOTAL: 0,
    };

    activitiesGrouped.forEach((group) => {
      const status = group.status as ActivityStatus;
      const count = group._count.id;
      activitiesCount[status] = count;
      activitiesCount.TOTAL += count;
    });

    return {
      totalPoint: user.totalPoint,
      trustScore: user.trustScore,
      activitiesCount,
      activeChallengesCount,
      recentPoints: recentPoints.map((item) => ({
        id: item.id,
        point: item.point,
        type: item.type,
        description: item.description,
        createdAt: item.createdAt,
      })),
    };
  }

  async getMerchantMetrics(merchantId: string): Promise<any> {
    const [
      activeProducts,
      activeVouchers,
      orderItems,
    ] = await Promise.all([
      prisma.product.count({
        where: {
          merchantId,
          status: "AVAILABLE",
        },
      }),
      prisma.voucher.count({
        where: {
          merchantId,
          status: "AVAILABLE",
        },
      }),
      prisma.orderItem.findMany({
        where: {
          product: {
            merchantId,
          },
          order: {
            status: {
              in: [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.COMPLETED],
            },
          },
        },
        select: {
          price: true,
          quantity: true,
          product: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    let totalRevenue = 0;
    let totalItemsSold = 0;

    // Product sales breakdown map
    const salesBreakdown: Record<string, { name: string; quantity: number; revenue: number }> = {};

    orderItems.forEach((item) => {
      const price = Number(item.price);
      const quantity = item.quantity;
      const itemRevenue = price * quantity;

      totalRevenue += itemRevenue;
      totalItemsSold += quantity;

      const productName = item.product.name;
      if (!salesBreakdown[productName]) {
        salesBreakdown[productName] = {
          name: productName,
          quantity: 0,
          revenue: 0,
        };
      }
      salesBreakdown[productName].quantity += quantity;
      salesBreakdown[productName].revenue += itemRevenue;
    });

    return {
      activeProducts,
      activeVouchers,
      salesSummary: {
        totalRevenue,
        totalItemsSold,
      },
      topSellingProducts: Object.values(salesBreakdown)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5),
    };
  }
}

export const dashboardRepository = new DashboardRepository();
