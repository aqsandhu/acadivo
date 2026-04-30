/**
 * @file src/modules/auth/2fa.service.ts
 * @description 2FA service using speakeasy and qrcode.
 */

import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { redis } from "../../config/redis";

// ── Setup 2FA ──

export async function setup2FA(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

  const secret = speakeasy.generateSecret({
    name: `Acadivo (${user.email})`,
    length: 32,
  });

  // Store secret temporarily in Redis (expires in 10 minutes)
  await redis.setex(`2fa:setup:${userId}`, 600, secret.base32);

  const otpauthUrl = secret.otpauth_url || speakeasy.otpauthURL({
    secret: secret.ascii,
    label: user.email,
    issuer: "Acadivo",
    encoding: "ascii",
  });

  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl!);

  return {
    message: "2FA setup initiated. Scan the QR code with your authenticator app.",
    secret: secret.base32,
    otpauthUrl,
    qrCodeDataUrl,
  };
}

// ── Verify 2FA (for setup completion) ──

export async function verify2FA(userId: string, code: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

  const tempSecret = await redis.get(`2fa:setup:${userId}`);
  const secretToVerify = user.twoFactorSecret || tempSecret;

  if (!secretToVerify) throw ApiError.badRequest("2FA not set up", "2FA_NOT_SETUP");

  const isValid = speakeasy.totp.verify({
    secret: secretToVerify,
    encoding: "base32",
    token: code,
    window: 2,
  });

  if (!isValid) {
    throw ApiError.badRequest("Invalid 2FA code", "INVALID_2FA_CODE");
  }

  return { message: "2FA code verified" };
}

// ── Enable 2FA ──

export async function enable2FA(userId: string, code: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

  const tempSecret = await redis.get(`2fa:setup:${userId}`);
  if (!tempSecret) throw ApiError.badRequest("2FA setup expired or not initiated", "2FA_NOT_SETUP");

  const isValid = speakeasy.totp.verify({
    secret: tempSecret,
    encoding: "base32",
    token: code,
    window: 2,
  });

  if (!isValid) {
    throw ApiError.badRequest("Invalid 2FA code", "INVALID_2FA_CODE");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true, twoFactorSecret: tempSecret },
  });

  await redis.del(`2fa:setup:${userId}`);

  return { message: "2FA enabled successfully" };
}

// ── Disable 2FA ──

export async function disable2FA(userId: string, code: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorSecret) throw ApiError.badRequest("2FA not set up", "2FA_NOT_SETUP");

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 2,
  });

  if (!isValid) {
    throw ApiError.badRequest("Invalid 2FA code", "INVALID_2FA_CODE");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  return { message: "2FA disabled successfully" };
}

// ── Verify 2FA for Login ──

export async function verify2FALogin(userId: string, code: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorSecret) throw ApiError.badRequest("2FA not set up", "2FA_NOT_SETUP");

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 2,
  });

  if (!isValid) {
    throw ApiError.badRequest("Invalid 2FA code", "INVALID_2FA_CODE");
  }

  return { verified: true, message: "2FA verified" };
}
