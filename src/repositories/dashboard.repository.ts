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
      totalProducts,
      totalTransactions,
      totalVouchers,
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
          totalPoint: {
            gt: 0,
          },
        },
        orderBy: {
          totalPoint: "desc",
        },
        take: 10,
        select: {
          id: true,
          name: true,
          username: true,
          totalPoint: true,
          trustScore: true,
          profileImageUrl: true,
        },
      }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.voucher.count(),
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
      totalProducts,
      totalTransactions,
      totalVouchers,
    };
  }

  async getUserMetrics(userId: string): Promise<any> {
    const [
      user,
      activitiesGrouped,
      activeChallengesCount,
      recentPoints,
      topUsers,
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
      prisma.user.findMany({
        where: {
          deletedAt: null,
          role: "USER",
          totalPoint: {
            gt: 0,
          },
        },
        orderBy: {
          totalPoint: "desc",
        },
        take: 10,
        select: {
          id: true,
          name: true,
          username: true,
          totalPoint: true,
          trustScore: true,
          profileImageUrl: true,
        },
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
      topUsers,
    };
  }

  async getMerchantMetrics(merchantId: string): Promise<any> {
    const [
      totalProducts,
      activeProducts,
      outOfStockProducts,
      recentProducts,
      orderItems,
    ] = await Promise.all([
      prisma.product.count({
        where: { merchantId },
      }),
      prisma.product.count({
        where: {
          merchantId,
          status: "AVAILABLE",
        },
      }),
      prisma.product.count({
        where: {
          merchantId,
          OR: [
            { stock: 0 },
            { status: "OUT_OF_STOCK" },
          ],
        },
      }),
      prisma.product.findMany({
        where: { merchantId },
        orderBy: { createdAt: "desc" },
        take: 5,
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
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              createdAt: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
    ]);

    let totalRevenue = 0;
    let totalItemsSold = 0;

    // Product sales breakdown map
    const salesBreakdown: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    // Unique orders lookup
    const uniqueOrdersMap = new Map<string, any>();

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

      const ord = item.order;
      if (ord) {
        if (!uniqueOrdersMap.has(ord.id)) {
          uniqueOrdersMap.set(ord.id, {
            id: ord.id,
            orderNumber: ord.orderNumber,
            status: ord.status,
            createdAt: ord.createdAt,
            buyerName: ord.user?.name || "User",
            buyerEmail: ord.user?.email || "",
            totalPrice: 0,
            itemsCount: 0,
          });
        }
        const existing = uniqueOrdersMap.get(ord.id);
        existing.totalPrice += itemRevenue;
        existing.itemsCount += quantity;
      }
    });

    const uniqueOrders = Array.from(uniqueOrdersMap.values());
    const totalOrders = uniqueOrders.length;
    const recentOrders = uniqueOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalProducts,
      activeProducts,
      outOfStockProducts,
      recentProducts,
      salesSummary: {
        totalRevenue,
        totalItemsSold,
        totalOrders,
      },
      recentOrders,
      topSellingProducts: Object.values(salesBreakdown)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5),
    };
  }
}

export const dashboardRepository = new DashboardRepository();
