import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/utils/response";
import { verifyAccessToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    // 1. Get top users (only with points > 0)
    const topUsers = await prisma.user.findMany({
      where: {
        deletedAt: null,
        role: {
          in: ["USER", "UMKM"],
        },
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
        profileImageUrl: true,
      },
    });

    // 2. Optional auth check to get current user rank and points
    let userRank = null;
    let userPoints = null;

    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const parts = authHeader.split(" ");
      if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
        const payload = await verifyAccessToken(parts[1]);
        if (payload) {
          const loggedInUserId = payload.id;
          
          // Calculate rank by ordering all active users with points > 0 descending
          const allUsers = await prisma.user.findMany({
            where: { 
              deletedAt: null, 
              role: {
                in: ["USER", "UMKM"],
              },
              totalPoint: {
                gt: 0,
              },
            },
            orderBy: { totalPoint: "desc" },
            select: { id: true, totalPoint: true },
          });
          
          const index = allUsers.findIndex((u) => u.id === loggedInUserId);
          if (index !== -1) {
            userRank = index + 1;
            userPoints = allUsers[index].totalPoint;
          }
        }
      }
    }

    return successResponse({
      topUsers,
      userRank,
      userPoints,
    }, 200);
  } catch (error) {
    return errorResponse(error);
  }
}
