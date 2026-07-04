import { prisma } from "@/lib/prisma";
import { Activity, ActivityStatus, ActivityPhoto, ActivityVerification, VerificationMethod, ActivityCategory } from "@prisma/client";

export class ActivityRepository {
  async findCategoryById(id: string): Promise<ActivityCategory | null> {
    return prisma.activityCategory.findUnique({
      where: { id },
    });
  }

  async findManyCategories(): Promise<ActivityCategory[]> {
    return prisma.activityCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }
  async create(data: {
    userId: string;
    categoryId: string;
    title: string;
    description?: string;
    activityDate: Date;
    location?: string;
  }): Promise<Activity> {
    return prisma.activity.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description || null,
        activityDate: data.activityDate,
        location: data.location || null,
        status: ActivityStatus.PENDING,
      },
    });
  }

  async findById(id: string): Promise<(Activity & {
    category: any;
    photos: ActivityPhoto[];
    verification: ActivityVerification | null;
    pointHistory: any | null;
  }) | null> {
    return prisma.activity.findUnique({
      where: { id },
      include: {
        category: true,
        photos: true,
        verification: true,
        pointHistory: true,
      },
    }) as any;
  }

  async findMany(params: {
    skip: number;
    take: number;
    search?: string;
    categoryId?: string;
    status?: ActivityStatus;
    userId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<Activity[]> {
    const where: any = {};

    if (params.userId) {
      where.userId = params.userId;
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (params.sortBy) {
      orderBy[params.sortBy] = params.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    return prisma.activity.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy,
      include: {
        category: true,
        photos: true,
        verification: true,
      },
    });
  }

  async count(params: {
    search?: string;
    categoryId?: string;
    status?: ActivityStatus;
    userId?: string;
  }): Promise<number> {
    const where: any = {};

    if (params.userId) {
      where.userId = params.userId;
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    return prisma.activity.count({ 
      where 
    });
  }

  async update(
    id: string,
    data: {
      categoryId?: string;
      title?: string;
      description?: string;
      activityDate?: Date;
      location?: string;
      adminNote?: string;
      status?: ActivityStatus;
    }
  ): Promise<Activity> {
    return prisma.activity.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.activity.delete({
      where: { id },
    });
  }

  async addPhoto(activityId: string, imageUrl: string): Promise<ActivityPhoto> {
    return prisma.activityPhoto.create({
      data: {
        activityId,
        imageUrl,
      },
    });
  }

  async submitVerification(
    activityId: string,
    data: {
      verifiedBy: string;
      method: VerificationMethod;
      confidence?: number;
      note?: string;
    }
  ): Promise<ActivityVerification> {
    return prisma.activityVerification.upsert({
      where: { activityId },
      update: {
        verifiedBy: data.verifiedBy,
        method: data.method,
        confidence: data.confidence,
        note: data.note,
      },
      create: {
        activityId,
        verifiedBy: data.verifiedBy,
        method: data.method,
        confidence: data.confidence,
        note: data.note,
      },
    });
  }

  async approve(
    activityId: string,
    adminId: string,
    pointReward: number,
    note?: string
  ): Promise<Activity> {
    return prisma.$transaction(async (tx) => {
      const activity = await tx.activity.update({
        where: { id: activityId },
        data: {
          status: ActivityStatus.APPROVED,
        },
      });

      await tx.activityVerification.upsert({
        where: { activityId },
        update: {
          verifiedBy: adminId,
          method: VerificationMethod.MANUAL,
          confidence: 100.0,
          note: note || "Approved by Admin",
        },
        create: {
          activityId,
          verifiedBy: adminId,
          method: VerificationMethod.MANUAL,
          confidence: 100.0,
          note: note || "Approved by Admin",
        },
      });

      await tx.pointHistory.create({
        data: {
          userId: activity.userId,
          activityId: activity.id,
          type: "EARN",
          point: pointReward,
          description: `Point reward for activity: ${activity.title}`,
        },
      });

      await tx.user.update({
        where: { id: activity.userId },
        data: {
          totalPoint: {
            increment: pointReward,
          },
        },
      });

      return activity;
    });
  }

  async reject(
    activityId: string,
    adminId: string,
    adminNote: string,
    note?: string
  ): Promise<Activity> {
    return prisma.$transaction(async (tx) => {
      const activity = await tx.activity.update({
        where: { id: activityId },
        data: {
          status: ActivityStatus.REJECTED,
          adminNote,
        },
      });

      await tx.activityVerification.upsert({
        where: { activityId },
        update: {
          verifiedBy: adminId,
          method: VerificationMethod.MANUAL,
          confidence: 0.0,
          note: note || adminNote || "Rejected by Admin",
        },
        create: {
          activityId,
          verifiedBy: adminId,
          method: VerificationMethod.MANUAL,
          confidence: 0.0,
          note: note || adminNote || "Rejected by Admin",
        },
      });

      return activity;
    });
  }
}

export const activityRepository = new ActivityRepository();
