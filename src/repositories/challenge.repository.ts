import { prisma } from "@/lib/prisma";
import { Challenge, ChallengeStatus, Prisma } from "@prisma/client";

export class ChallengeRepository {
  async findById(id: string): Promise<any | null> {
    return prisma.challenge.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async findAll(params: {
    status?: ChallengeStatus;
    categoryId?: string;
    search?: string;
  }): Promise<any[]> {
    const where: Prisma.ChallengeWhereInput = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    return prisma.challenge.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });
  }

  async findParticipant(challengeId: string, userId: string): Promise<any | null> {
    return prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
      include: {
        challenge: true,
      },
    });
  }

  async joinChallenge(challengeId: string, userId: string, targetValue: number): Promise<any> {
    return prisma.$transaction(async (tx) => {
      const participant = await tx.challengeParticipant.create({
        data: {
          challengeId,
          userId,
          status: "JOINED",
        },
        include: {
          challenge: true,
        },
      });

      const progress = await tx.challengeProgress.create({
        data: {
          challengeId,
          userId,
          targetValue,
          currentValue: 0,
          progressPercent: 0,
        },
      });

      return { participant, progress };
    });
  }

  async leaveChallenge(challengeId: string, userId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.challengeProgress.delete({
        where: {
          challengeId_userId: {
            challengeId,
            userId,
          },
        },
      });

      await tx.challengeParticipant.delete({
        where: {
          challengeId_userId: {
            challengeId,
            userId,
          },
        },
      });
    });
  }

  async findUserJoined(userId: string): Promise<any[]> {
    return prisma.challengeParticipant.findMany({
      where: {
        userId,
      },
      include: {
        challenge: {
          include: {
            category: true,
          },
        },
        user: true,
      },
      orderBy: {
        joinedAt: "desc",
      },
    });
  }

  async findProgress(challengeId: string, userId: string): Promise<any | null> {
    return prisma.challengeProgress.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
    });
  }

  async createChallenge(data: {
    categoryId: string;
    title: string;
    description?: string | null;
    type: string;
    target: number;
    pointReward: number;
    startDate: Date;
    endDate: Date;
    status: string;
    imageUrl?: string | null;
  }): Promise<Challenge> {
    return prisma.challenge.create({
      data: data as any,
      include: {
        category: true,
      },
    });
  }

  async updateChallenge(
    id: string,
    data: {
      categoryId?: string;
      title?: string;
      description?: string | null;
      type?: string;
      target?: number;
      pointReward?: number;
      startDate?: Date;
      endDate?: Date;
      status?: string;
      imageUrl?: string | null;
    }
  ): Promise<Challenge> {
    return prisma.challenge.update({
      where: { id },
      data: data as any,
      include: {
        category: true,
      },
    });
  }

  async deleteChallenge(id: string): Promise<Challenge> {
    return prisma.challenge.delete({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async findManyCategories(): Promise<any[]> {
    return prisma.challengeCategory.findMany({
      orderBy: { name: "asc" },
    });
  }
}

export const challengeRepository = new ChallengeRepository();
