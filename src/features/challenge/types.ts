export type ChallengeType = "DAILY" | "WEEKLY" | "MONTHLY" | "EVENT";
export type ChallengeStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type ParticipantStatus = "JOINED" | "COMPLETED" | "FAILED";

export interface ChallengeCategory {
  id: string;
  name: string;
}

export interface ChallengeProgress {
  currentValue: number;
  targetValue: number;
  progressPercent: number;
}

export interface Challenge {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  type: ChallengeType;
  target: number;
  pointReward: number;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
  imageUrl: string | null;
  category?: ChallengeCategory;
  progress?: ChallengeProgress;
}

export interface UserChallenge {
  id: string;
  status: ParticipantStatus;
  joinedAt: string;
  completedAt: string | null;
  challenge: Challenge;
}
