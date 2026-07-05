export type UserRole = "USER" | "UMKM" | "ADMIN";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  trustScore: number;
  totalPoint: number;
  accumulatedPoint?: number;
  createdAt: string;
  phone?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  address?: string | null;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
  deviceName?: string;
  loginMode?: string;
}

export interface LoginResponseData {
  user: User;
  accessToken: string;
}
