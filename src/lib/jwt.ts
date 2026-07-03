import * as jose from "jose";
import { env } from "./env";

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  username: string;
}

const accessTokenSecret = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET);
const refreshTokenSecret = new TextEncoder().encode(env.REFRESH_TOKEN_SECRET);

export async function generateAccessToken(payload: JWTPayload): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(accessTokenSecret);
}

export async function generateRefreshToken(payload: JWTPayload): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(refreshTokenSecret);
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, accessTokenSecret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, refreshTokenSecret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}