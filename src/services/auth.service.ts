import bcrypt from "bcrypt";
import { userRepository } from "@/repositories/user.repository";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from "@/utils/errors";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  JWTPayload,
} from "@/lib/jwt";

export interface SafeUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  trustScore: number;
  totalPoint: number;
  createdAt: Date;
  phone?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  address?: string | null;
}

export class AuthService {
  private toSafeUser(user: any): SafeUser {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      trustScore: user.trustScore,
      totalPoint: user.totalPoint,
      createdAt: user.createdAt,
      phone: user.phone,
      profileImageUrl: user.profileImageUrl,
      bio: user.bio,
      address: user.address,
    };
  }

  async register(data: {
    name: string;
    username: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<SafeUser> {
    if (!data.name || !data.username || !data.email || !data.password) {
      throw new ValidationError("Missing required registration fields");
    }

    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError("Email is already registered");
    }

    const existingUsername = await userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError("Username is already taken");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await userRepository.create({
      name: data.name,
      username: data.username,
      email: data.email,
      passwordHash,
      role: data.role,
    });

    return this.toSafeUser(user);
  }

  async login(
    credentials: { email: string; password?: string; loginMode?: string },
    context: { deviceName?: string; ipAddress?: string; userAgent?: string }
  ): Promise<{ user: SafeUser; accessToken: string; refreshToken: string }> {
    if (!credentials.email || !credentials.password) {
      throw new ValidationError("Email and password are required");
    }

    const user = await userRepository.findByEmail(credentials.email);
    if (!user || !user.passwordHash || !user.isActive) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const dbUserRole = user.role;
    let sessionRole: UserRole = "USER";

    if (dbUserRole === "ADMIN") {
      sessionRole = "ADMIN";
    } else if (dbUserRole === "UMKM") {
      sessionRole = credentials.loginMode === "UMKM" ? "UMKM" : "USER";
    } else {
      if (credentials.loginMode === "UMKM") {
        throw new ValidationError("Akun Anda belum terdaftar/disetujui sebagai Mitra UMKM.");
      }
      sessionRole = "USER";
    }

    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      role: sessionRole,
      username: user.username,
    };

    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);

    // Refresh Token expires in 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await userRepository.saveRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt,
      deviceName: context.deviceName,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    const safeUser = this.toSafeUser(user);
    safeUser.role = sessionRole;

    return {
      user: safeUser,
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string): Promise<{ accessToken: string }> {
    if (!token) {
      throw new ValidationError("Refresh token is required");
    }

    const dbToken = await userRepository.findRefreshToken(token);
    if (!dbToken || dbToken.isRevoked || new Date() > dbToken.expiresAt) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const payload = await verifyRefreshToken(token);
    if (!payload) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await userRepository.findById(payload.id);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("User is no longer active");
    }

    const newAccessToken = await generateAccessToken({
      id: user.id,
      email: user.email,
      role: payload.role || user.role,
      username: user.username,
    });

    return { accessToken: newAccessToken };
  }

  async logout(token: string): Promise<void> {
    if (!token) {
      throw new ValidationError("Refresh token is required to logout");
    }
    await userRepository.deleteRefreshToken(token);
  }

  async updateProfile(userId: string, data: {
    name?: string;
    username?: string;
    email?: string;
    phone?: string | null;
    profileImageUrl?: string | null;
    bio?: string | null;
    address?: string | null;
  }): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new NotFoundError("User not found");
    }

    if (data.name !== undefined && !data.name.trim()) {
      throw new ValidationError("Nama tidak boleh kosong");
    }

    if (data.email !== undefined) {
      if (!data.email.trim()) {
        throw new ValidationError("Email tidak boleh kosong");
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new ValidationError("Format email tidak valid");
      }
      if (data.email.toLowerCase() !== user.email.toLowerCase()) {
        const existingEmail = await userRepository.findByEmail(data.email);
        if (existingEmail) {
          throw new ConflictError("Email sudah terdaftar pada akun lain");
        }
      }
    }

    if (data.username !== undefined) {
      if (!data.username.trim()) {
        throw new ValidationError("Username tidak boleh kosong");
      }
      if (data.username !== user.username) {
        const existingUsername = await userRepository.findByUsername(data.username);
        if (existingUsername) {
          throw new ConflictError("Username sudah digunakan");
        }
      }
    }

    if (data.phone !== undefined && data.phone !== null && data.phone.trim() !== "") {
      const phoneRegex = /^[0-9+\-\s]{8,20}$/;
      if (!phoneRegex.test(data.phone)) {
        throw new ValidationError("Format nomor telepon tidak valid");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name ?? undefined,
        username: data.username ?? undefined,
        email: data.email ? data.email.toLowerCase() : undefined,
        phone: data.phone,
        profileImageUrl: data.profileImageUrl,
        bio: data.bio,
        address: data.address,
      },
    });

    return this.toSafeUser(updatedUser);
  }

  async me(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new NotFoundError("User not found or inactive");
    }
    return this.toSafeUser(user);
  }
}

export const authService = new AuthService();