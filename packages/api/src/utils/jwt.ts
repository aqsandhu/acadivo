/**
 * @file src/utils/jwt.ts
 * @description JWT sign and verify helper for access, refresh, and reset tokens.
 */

import jwt, { SignOptions, VerifyOptions, JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "./ApiError";

export interface TokenPayload {
  userId: string;
  role: string;
  tenantId: string | null;
  uniqueId: string;
  type: "access" | "refresh" | "reset" | "verify";
}

/**
 * Sign a JWT token.
 */
export function signToken(
  payload: Omit<TokenPayload, "type"> & { type: TokenPayload["type"] },
  options?: SignOptions
): string {
  const secret =
    payload.type === "access"
      ? env.JWT_ACCESS_SECRET
      : payload.type === "refresh"
      ? env.JWT_REFRESH_SECRET
      : payload.type === "reset"
      ? env.JWT_RESET_SECRET
      : env.JWT_ACCESS_SECRET;

  const expiresIn =
    options?.expiresIn ||
    (payload.type === "access"
      ? env.JWT_ACCESS_EXPIRY
      : payload.type === "refresh"
      ? env.JWT_REFRESH_EXPIRY
      : payload.type === "reset"
      ? env.JWT_RESET_EXPIRY
      : "1h");

  return jwt.sign(payload, secret, { ...options, expiresIn });
}

/**
 * Verify a JWT token.
 */
export function verifyToken(
  token: string,
  type: TokenPayload["type"] = "access"
): TokenPayload {
  const secret =
    type === "access"
      ? env.JWT_ACCESS_SECRET
      : type === "refresh"
      ? env.JWT_REFRESH_SECRET
      : type === "reset"
      ? env.JWT_RESET_SECRET
      : env.JWT_ACCESS_SECRET;

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload & JwtPayload;
    return decoded;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Token has expired", "TOKEN_EXPIRED");
    }
    if (err.name === "JsonWebTokenError") {
      throw ApiError.unauthorized("Invalid token", "INVALID_TOKEN");
    }
    throw ApiError.unauthorized("Token verification failed", "TOKEN_VERIFICATION_FAILED");
  }
}

/**
 * Generate access + refresh token pair.
 */
export function generateTokenPair(user: {
  id: string;
  role: string;
  tenantId: string | null;
  uniqueId: string;
}): { accessToken: string; refreshToken: string } {
  const base = { userId: user.id, role: user.role, tenantId: user.tenantId, uniqueId: user.uniqueId };
  const accessToken = signToken({ ...base, type: "access" });
  const refreshToken = signToken({ ...base, type: "refresh" });
  return { accessToken, refreshToken };
}
