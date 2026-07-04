import { z } from "zod";
import { activityRepository } from "@/repositories/activity.repository";
import { userRepository } from "@/repositories/user.repository";
import { ActivityStatus, VerificationMethod } from "@prisma/client";
import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "@/utils/errors";
import { getPaginationMetadata } from "@/utils/pagination";

const createActivitySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().optional(),
  categoryId: z.string().uuid("Invalid category ID"),
  activityDate: z.preprocess((val) => new Date(val as string), z.date()),
  location: z.string().max(255).optional(),
});

const updateActivitySchema = z.object({
  title: z.string().min(3).max(150).optional(),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  activityDate: z.preprocess((val) => (val ? new Date(val as string) : undefined), z.date().optional()),
  location: z.string().max(255).optional(),
});

export class ActivityService {
  async createActivity(
    userId: string,
    data: unknown
  ) {
    const parsed = createActivitySchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Invalid activity data", parsed.error.format() as any);
    }

    const category = await activityRepository.findCategoryById(parsed.data.categoryId);
    if (!category || !category.isActive) {
      throw new NotFoundError("Activity category not found or inactive");
    }

    return activityRepository.create({
      userId,
      ...parsed.data,
    });
  }

  async getDetail(activityId: string, userId: string, userRole: string) {
    const activity = await activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (userRole !== "ADMIN" && activity.userId !== userId) {
      throw new ForbiddenError("You do not have permission to view this activity");
    }

    return activity;
  }

  async updateActivity(activityId: string, userId: string, userRole: string, data: unknown) {
    const parsed = updateActivitySchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Invalid activity data", parsed.error.format() as any);
    }

    const activity = await activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.userId !== userId) {
      throw new ForbiddenError("You do not have permission to update this activity");
    }

    if (activity.status !== ActivityStatus.PENDING) {
      throw new ValidationError("Cannot update activity that is already verified (approved/rejected)");
    }

    if (parsed.data.categoryId) {
      const category = await activityRepository.findCategoryById(parsed.data.categoryId);
      if (!category || !category.isActive) {
        throw new NotFoundError("Activity category not found or inactive");
      }
    }

    return activityRepository.update(activityId, parsed.data);
  }

  async deleteActivity(activityId: string, userId: string, userRole: string) {
    const activity = await activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.userId !== userId) {
      throw new ForbiddenError("You do not have permission to delete this activity");
    }

    if (activity.status !== ActivityStatus.PENDING) {
      throw new ValidationError("Cannot delete activity that is already verified (approved/rejected)");
    }

    await activityRepository.delete(activityId);
  }

  async addPhoto(activityId: string, userId: string, userRole: string, imageUrl: string) {
    if (!imageUrl) {
      throw new ValidationError("Image URL is required");
    }

    const activity = await activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.userId !== userId) {
      throw new ForbiddenError("You do not have permission to modify this activity");
    }

    if (activity.status !== ActivityStatus.PENDING) {
      throw new ValidationError("Cannot add photo to already verified activity");
    }

    return activityRepository.addPhoto(activityId, imageUrl);
  }

  async submitActivity(activityId: string, userId: string) {
    const activity = await activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.userId !== userId) {
      throw new ForbiddenError("You do not have permission to submit this activity");
    }

    if (activity.photos.length === 0) {
      throw new ValidationError("Activity must have at least one photo before submission");
    }

    // Mock AI check logic
    const adminUser = await userRepository.findFirstAdmin();
    const verifierId = adminUser ? adminUser.id : userId;

    await activityRepository.submitVerification(activityId, {
      verifiedBy: verifierId,
      method: VerificationMethod.AI,
      confidence: 88.5,
      note: "Auto verified by AI",
    });

    return activityRepository.findById(activityId);
  }

  async approveActivity(activityId: string, adminId: string, note?: string) {
    const activity = await activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.status !== ActivityStatus.PENDING) {
      throw new ValidationError("Activity is already verified");
    }

    // Get point reward from category
    const category = await activityRepository.findCategoryById(activity.categoryId);
    const points = category ? category.pointReward : 50; // Fallback to 50

    return activityRepository.approve(activityId, adminId, points, note);
  }

  async rejectActivity(activityId: string, adminId: string, adminNote: string, note?: string) {
    if (!adminNote) {
      throw new ValidationError("Admin note is required to reject activity");
    }

    const activity = await activityRepository.findById(activityId);
    if (!activity) {
      throw new NotFoundError("Activity not found");
    }

    if (activity.status !== ActivityStatus.PENDING) {
      throw new ValidationError("Activity is already verified");
    }

    return activityRepository.reject(activityId, adminId, adminNote, note);
  }

  async listActivities(params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    status?: string;
    userId?: string;
    userRole?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const skip = (params.page - 1) * params.limit;
    const take = params.limit;

    // Validate and clean status
    let statusFilter: ActivityStatus | undefined;
    if (params.status && params.status.trim() !== "") {
      if (!Object.values(ActivityStatus).includes(params.status as ActivityStatus)) {
        throw new ValidationError(`Invalid status. Must be one of: ${Object.values(ActivityStatus).join(", ")}`);
      }
      statusFilter = params.status as ActivityStatus;
    }

    // Validate and clean categoryId
    let validCategoryId: string | undefined;
    if (params.categoryId && params.categoryId.trim() !== "") {
      const parsedCat = z.string().uuid().safeParse(params.categoryId);
      if (!parsedCat.success) {
        throw new ValidationError("Invalid categoryId format");
      }
      validCategoryId = parsedCat.data;
    }

    // Validate and clean userId
    let validUserId: string | undefined;
    if (params.userId && params.userId.trim() !== "") {
      const parsedUser = z.string().uuid().safeParse(params.userId);
      if (!parsedUser.success) {
        throw new ValidationError("Invalid userId format");
      }
      validUserId = parsedUser.data;
    }

    const validSearch = params.search && params.search.trim() !== "" ? params.search : undefined;

    const activities = await activityRepository.findMany({
      skip,
      take,
      search: validSearch,
      categoryId: validCategoryId,
      status: statusFilter,
      userId: validUserId,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });

    const totalCount = await activityRepository.count({
      search: validSearch,
      categoryId: validCategoryId,
      status: statusFilter,
      userId: validUserId,
    });

    const meta = getPaginationMetadata(totalCount, params.page, params.limit);

    return {
      activities,
      meta,
    };
  }

  async listCategories() {
    return activityRepository.findManyCategories();
  }
}

export const activityService = new ActivityService();
