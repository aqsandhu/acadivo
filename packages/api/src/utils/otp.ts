/**
 * @file src/utils/otp.ts
 * @description OTP generation, storage (Redis), and verification helper.
 */

import crypto from "crypto";
import { redis } from "../config/redis";
import { logger } from "./logger";

const OTP_TTL_SECONDS = 600; // 10 minutes

/**
 * Generate a 6-digit numeric OTP.
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Store an OTP in Redis keyed by identifier (e.g., phone number).
 * @param identifier - Unique key (phone number, email, or userId)
 * @param otp - The OTP string
 * @param ttl - Time-to-live in seconds (default 600)
 */
export async function storeOTP(
  identifier: string,
  otp: string,
  ttl = OTP_TTL_SECONDS
): Promise<void> {
  const key = `otp:${identifier}`;
  await redis.setex(key, ttl, otp);
  logger.info(`OTP stored for ${identifier}`);
}

/**
 * Verify an OTP against the stored value and delete it on success.
 * @param identifier - Unique key
 * @param otp - OTP to verify
 * @returns True if valid and deleted
 */
export async function verifyOTP(identifier: string, otp: string): Promise<boolean> {
  const key = `otp:${identifier}`;
  const stored = await redis.get(key);
  if (!stored) return false;
  if (stored !== otp) return false;
  await redis.del(key);
  logger.info(`OTP verified for ${identifier}`);
  return true;
}

/**
 * Generate and store an OTP in one call.
 * @returns The generated OTP
 */
export async function createAndStoreOTP(identifier: string): Promise<string> {
  const otp = generateOTP();
  await storeOTP(identifier, otp);
  return otp;
}
