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
}

export const challengeService = new ChallengeService();
