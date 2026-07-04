export type UserRole = "USER" | "UMKM" | "ADMIN";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  trustScore: number;
  totalPoint: number;
  createdAt: string;
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
}

export interface LoginResponseData {
  user: User;
  accessToken: string;
}
