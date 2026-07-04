export type ActivityStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ActivityCategory {
  id: string;
  name: string;
  description: string | null;
  pointReward: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityPhoto {
  id: string;
  activityId: string;
  imageUrl: string;
  latitude: number | null;
  longitude: number | null;
  takenAt: string | null;
  hasExif: boolean;
  uploadedAt: string;
}

export interface ActivityVerification {
  id: string;
  activityId: string;
  verifiedBy: string;
  method: "MANUAL" | "AI";
  confidence: number | null;
  note: string | null;
  verifiedAt: string;
}

export interface PointHistoryEntry {
  id: string;
  userId: string;
  activityId: string | null;
  type: "EARN" | "REDEEM" | "BONUS" | "PENALTY";
  point: number;
  description: string | null;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string | null;
  activityDate: string;
  status: ActivityStatus;
  adminNote: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
  category?: ActivityCategory;
  photos?: ActivityPhoto[];
  verification?: ActivityVerification | null;
  pointHistory?: PointHistoryEntry | null;
}

export interface ActivityListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: ActivityStatus;
  userId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateActivityPayload {
  image: File;
  title: string;
  description?: string;
  categoryId: string;
  activityDate: string; // ISO 8601
  location?: string;
}

export interface UpdateActivityPayload {
  title?: string;
  description?: string;
  categoryId?: string;
  activityDate?: string;
  location?: string;
}
