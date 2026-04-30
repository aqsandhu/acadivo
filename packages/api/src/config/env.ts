/**
 * @file src/config/env.ts
 * @description Type-safe environment configuration loader using Zod validation.
 * Ensures all required environment variables are present and correctly typed at boot time.
 */

import { z } from "zod";

// ────────────────────────────────────────────────
// Environment Variable Schema
// ────────────────────────────────────────────────

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_RESET_SECRET: z.string().min(1, "JWT_RESET_SECRET is required"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),
  JWT_RESET_EXPIRY: z.string().default("1h"),

  // Email / SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().default("noreply@acadivo.com"),
  FROM_NAME: z.string().default("Acadivo"),

  // SMS / Twilio
  TWILIO_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Pakistani SMS Gateway
  PAK_SMS_PROVIDER: z.enum(["jazz", "zong", "telenor", "twilio"]).default("twilio"),
  JAZZ_API_KEY: z.string().optional(),
  JAZZ_API_SECRET: z.string().optional(),
  JAZZ_API_ENDPOINT: z.string().url().optional(),
  ZONG_API_KEY: z.string().optional(),
  ZONG_API_ENDPOINT: z.string().url().optional(),
  TELENOR_API_KEY: z.string().optional(),
  TELENOR_API_ENDPOINT: z.string().url().optional(),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // App URLs
  WEB_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:5000"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "verbose", "debug", "silly"]).default("info"),
  LOG_FILE: z.string().default("logs/app.log"),
  LOG_ERROR_FILE: z.string().default("logs/error.log"),
});

// ────────────────────────────────────────────────
// Parse & Validate
// ────────────────────────────────────────────────

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  parsed.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
