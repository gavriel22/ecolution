import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection URL"),
  ACCESS_TOKEN_SECRET: z.string().default(process.env.JWT_ACCESS_SECRET || "default_access_token_secret_ecolution_2026"),
  REFRESH_TOKEN_SECRET: z.string().default(process.env.JWT_REFRESH_SECRET || "default_refresh_token_secret_ecolution_2026"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  throw new Error("Invalid environment variables configured.");
}

export const env = parsed.data;
