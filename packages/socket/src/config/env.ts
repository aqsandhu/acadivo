/**
 * Environment validation for Socket.io server
 */

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  PORT: parseInt(getEnvVar("SOCKET_PORT", "5001"), 10),

  // CORS
  CORS_ORIGINS: getEnvVar("CORS_ORIGINS", "http://localhost:3000,http://localhost:19006")
    .split(",")
    .map((o) => o.trim()),

  // Redis
  REDIS_URL: getEnvVar("REDIS_URL", "redis://localhost:6379"),

  // JWT
  JWT_ACCESS_SECRET: getEnvVar("JWT_ACCESS_SECRET", "acadivo-dev-secret-key"),

  // Main API
  API_BASE_URL: getEnvVar("API_BASE_URL", "http://localhost:4000"),
  API_INTERNAL_KEY: getEnvVar("API_INTERNAL_KEY", ""),

  // Firebase (optional)
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "",
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || "",
  FIREBASE_PRIVATE_KEY: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),

  // Presence
  PRESENCE_TTL_SECONDS: parseInt(process.env.PRESENCE_TTL_SECONDS || "300", 10),
} as const;

export type Env = typeof env;
