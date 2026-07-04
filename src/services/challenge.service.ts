import { z } from "zod";
import { challengeRepository } from "@/repositories/challenge.repository";
import { ChallengeStatus, ParticipantStatus } from "@prisma/client";
import {
  ValidationError,
  NotFoundError,
} from "@/utils/errors";

const joinChallengeSchema = z.object({
  challengeId: z.string().uuid("Invalid challenge ID format"),
});

export class ChallengeService {
  private mapChallenge(challenge: any, progress?: any) {
    return {
      id: challenge.id,
      categoryId: challenge.categoryId,
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      target: challenge.target,
      pointReward: challenge.pointReward,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      status: challenge.status,
      imageUrl: challenge.imageUrl,
      category: challenge.category
        ? {
            id: challenge.category.id,
            name: challenge.category.name,
          }
        : undefined,
      progress: progress
        ? {
            currentValue: progress.currentValue,
            targetValue: progress.targetValue,
            progressPercent: Number(progress.progressPercent),
          }
        : undefined,
    };
  }

  async listChallenges(params: { categoryId?: string; search?: string }) {
    // Only ACTIVE challenges are viewable by users
    const challenges = await challengeRepository.findAll({
      status: ChallengeStatus.ACTIVE,
      ...params,
    });

    return challenges.map((c) => this.mapChallenge(c));
  }

  async getChallenge(id: string) {
    const challenge = await challengeRepository.findById(id);
    if (!challenge) {
      throw new NotFoundError("Challenge not found");
    }

    return this.mapChallenge(challenge);
  }

  async getChallengeWithUserProgress(id: string, userId: string) {
    const challenge = await challengeRepository.findById(id);
    if (!challenge) {
      throw new NotFoundError("Challenge not found");
    }

    const progress = await challengeRepository.findProgress(id, userId);
    return this.mapChallenge(challenge, progress);
  }

  async joinChallenge(userId: string, data: unknown) {
    const parsed = joinChallengeSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Invalid request parameters", parsed.error.format() as any);
    }

    const challengeId = parsed.data.challengeId;

    const challenge = await challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundError("Challenge not found");
    }

    // 1. Date and status validation
    if (challenge.status !== ChallengeStatus.ACTIVE) {
      throw new ValidationError("This challenge is not active or has closed");
    }

    const now = new Date();
    if (new Date(challenge.startDate) > now) {
      throw new ValidationError("This challenge has not started yet");
    }
    if (new Date(challenge.endDate) < now) {
      throw new ValidationError("This challenge has already expired");
    }

    // 2. Prevent duplicate participation
    const existing = await challengeRepository.findParticipant(challengeId, userId);
    if (existing) {
      throw new ValidationError("You have already joined this challenge");
    }

    const result = await challengeRepository.joinChallenge(challengeId, userId, challenge.target);
    return this.mapChallenge(challenge, result.progress);
  }

  async leaveChallenge(challengeId: string, userId: string) {
    const participant = await challengeRepository.findParticipant(challengeId, userId);
    if (!participant) {
      throw new ValidationError("You are not a participant in this challenge");
    }

    // Cannot leave if completed
    if (participant.status === ParticipantStatus.COMPLETED) {
      throw new ValidationError("Cannot leave a challenge that you have already completed");
    }

    await challengeRepository.leaveChallenge(challengeId, userId);
  }

  async listUserJoinedChallenges(userId: string) {
    const joined = await challengeRepository.findUserJoined(userId);

    const mapped = await Promise.all(
      joined.map(async (j) => {
        const progress = await challengeRepository.findProgress(j.challengeId, userId);
        const mappedChallenge = this.mapChallenge(j.challenge, progress);
        return {
          id: j.id,
          status: j.status,
          joinedAt: j.joinedAt,
          completedAt: j.completedAt,
          challenge: mappedChallenge,
        };
      })
    );

    return mapped;
  }

  async listAllChallengesAdmin(userRole: UserRole) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only administrators can manage challenges");
    }
    const challenges = await challengeRepository.findAll({});
    return challenges.map((c) => this.mapChallenge(c));
  }

  async createChallenge(userRole: UserRole, data: unknown) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only administrators can manage challenges");
    }

    const parsed = createChallengeSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Invalid challenge data", parsed.error.format() as any);
    }

    const challenge = await challengeRepository.createChallenge(parsed.data);
    return this.mapChallenge(challenge);
  }

  async updateChallenge(id: string, userRole: UserRole, data: unknown) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only administrators can manage challenges");
    }

    const parsed = updateChallengeSchema.safeParse(data);
    if (!parsed.success) {
      throw new ValidationError("Invalid challenge data", parsed.error.format() as any);
    }

    const challenge = await challengeRepository.updateChallenge(id, parsed.data);
    return this.mapChallenge(challenge);
  }

  async deleteChallenge(id: string, userRole: UserRole) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenError("Only administrators can manage challenges");
    }

    const challenge = await challengeRepository.findById(id);
    if (!challenge) {
      throw new NotFoundError("Challenge not found");
    }

    await challengeRepository.deleteChallenge(id);
  }

  async listChallengeCategories() {
    return challengeRepository.findManyCategories();
  }
}

import { UserRole, ChallengeType } from "@prisma/client";
import { ForbiddenError } from "@/utils/errors";

const createChallengeSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID format"),
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().max(1000).optional().nullable(),
  type: z.nativeEnum(ChallengeType),
  target: z.preprocess((val) => Number(val), z.number().int().positive("Target must be at least 1")),
  pointReward: z.preprocess((val) => Number(val), z.number().int().positive("Reward points must be positive")),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]),
  imageUrl: z.string().max(255).url("Invalid image URL").optional().nullable(),
});

const updateChallengeSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID format").optional(),
  title: z.string().min(3, "Title must be at least 3 characters").max(150).optional(),
  description: z.string().max(1000).optional().nullable(),
  type: z.nativeEnum(ChallengeType).optional(),
  target: z.preprocess((val) => Number(val), z.number().int().positive("Target must be at least 1")).optional(),
  pointReward: z.preprocess((val) => Number(val), z.number().int().positive("Reward points must be positive")).optional(),
  startDate: z.string().transform((val) => new Date(val)).optional(),
  endDate: z.string().transform((val) => new Date(val)).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
  imageUrl: z.string().max(255).url("Invalid image URL").optional().nullable(),
});

export const challengeService = new ChallengeService();
