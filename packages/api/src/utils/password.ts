/**
 * @file src/utils/password.ts
 * @description Bcrypt password hash and compare helper with validation.
 */

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;
const MAX_PASSWORD_LENGTH = 128;
const MIN_PASSWORD_LENGTH = 6;

/**
 * Validate password length constraints.
 * Throws Error if password is too short or too long.
 */
export function validatePassword(plainPassword: string): void {
  if (!plainPassword || plainPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }
  if (plainPassword.length > MAX_PASSWORD_LENGTH) {
    throw new Error(`Password must not exceed ${MAX_PASSWORD_LENGTH} characters`);
  }
}

/**
 * Hash a plaintext password using bcrypt.
 * Validates password length before hashing.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  validatePassword(plainPassword);
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 */
export async function comparePassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}
