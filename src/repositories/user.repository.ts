import { prisma } from "@/lib/prisma";
import { User, UserRole, RefreshToken } from "@prisma/client";

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findFirstAdmin(): Promise<User | null> {
    return prisma.user.findFirst({
      where: { role: UserRole.ADMIN },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async create(data: {
    name: string;
    username: string;
    email: string;
    passwordHash?: string | null;
    role?: UserRole;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash ?? null,
        role: data.role ?? UserRole.USER,
        isActive: true,
      },
    });
  }

  async saveRefreshToken(params: {
    userId: string;
    token: string;
    expiresAt: Date;
    deviceName?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        userId: params.userId,
        token: params.token,
        expiresAt: params.expiresAt,
        deviceName: params.deviceName || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
    });
  }
}

export const userRepository = new UserRepository();