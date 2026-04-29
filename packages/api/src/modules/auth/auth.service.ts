/**
 * @file src/modules/auth/auth.service.ts
 * @description Business logic for authentication: register, login, refresh, logout,
 * password reset, 2FA, OTP, and profile management.
 */

import { Prisma } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "../../config/database";
import { redis } from "../../config/redis";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateTokenPair, signToken, verifyToken } from "../../utils/jwt";
import { createAndStoreOTP, verifyOTP } from "../../utils/otp";
import { sendOTPSMS } from "../../utils/sms";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../../utils/email";
import { logger } from "../../utils/logger";
import { buildPaginationMeta } from "../../utils/pagination";
import { uploadToCloudinary } from "../../utils/upload";
import type { UploadFile } from "../../utils/upload";
import { UserRole, TenantStatus, SubscriptionPlan, TenantType } from "@prisma/client";

// ────────────────────────────────────────────────
// DTOs / Interfaces
// ────────────────────────────────────────────────

export interface RegisterDTO {
  schoolName: string;
  schoolCode: string;
  schoolType: TenantType;
  city: string;
  address: string;
  schoolPhone: string;
  schoolEmail: string;
  principalFirstName: string;
  principalLastName: string;
  principalEmail: string;
  principalPhone: string;
  principalPassword: string;
  principalCNIC?: string;
  principalGender?: "MALE" | "FEMALE" | "OTHER";
  subscriptionPlan?: SubscriptionPlan;
}

export interface LoginDTO {
  uniqueId?: string;
  email?: string;
  password: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

export interface ChangePasswordDTO {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  avatarFile?: UploadFile;
}

export interface SetupParentPasswordDTO {
  phone: string;
  otp: string;
  newPassword: string;
}

// ────────────────────────────────────────────────
// Helper: generate unique ID
// ────────────────────────────────────────────────

function generateUniqueId(role: UserRole, tenantCode: string, seq: number): string {
  const prefix = role === "SUPER_ADMIN" ? "SA" : role === "PRINCIPAL" ? "PR" : role === "ADMIN" ? "AD" : role === "TEACHER" ? "TC" : role === "STUDENT" ? "ST" : "PA";
  return `${prefix}-${tenantCode}-${String(seq).padStart(4, "0")}`;
}

// ────────────────────────────────────────────────
// Register (Create School + Principal)
// ────────────────────────────────────────────────

export async function registerSchool(dto: RegisterDTO) {
  const existingTenant = await prisma.tenant.findUnique({ where: { code: dto.schoolCode } });
  if (existingTenant) {
    throw ApiError.conflict("School code already exists", "SCHOOL_CODE_EXISTS");
  }

  const existingEmail = await prisma.user.findFirst({
    where: { email: dto.principalEmail },
  });
  if (existingEmail) {
    throw ApiError.conflict("Email already registered", "EMAIL_EXISTS");
  }

  const passwordHash = await hashPassword(dto.principalPassword);

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: dto.schoolName,
        code: dto.schoolCode,
        type: dto.schoolType,
        city: dto.city,
        address: dto.address,
        phone: dto.schoolPhone,
        email: dto.schoolEmail,
        status: TenantStatus.PENDING,
        subscriptionPlan: dto.subscriptionPlan || SubscriptionPlan.FREE,
        createdBy: "system",
      },
    });

    const uniqueId = generateUniqueId(UserRole.PRINCIPAL, tenant.code, 1);

    const user = await tx.user.create({
      data: {
        uniqueId,
        email: dto.principalEmail,
        passwordHash,
        role: UserRole.PRINCIPAL,
        tenantId: tenant.id,
        firstName: dto.principalFirstName,
        lastName: dto.principalLastName,
        phone: dto.principalPhone,
        cnic: dto.principalCNIC || null,
        gender: dto.principalGender || null,
        isVerified: false,
      },
    });

    await tx.principal.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
      },
    });

    // Resolve subscription plan ID
    const planName = dto.subscriptionPlan || SubscriptionPlan.FREE;
    const planRecord = await tx.subscriptionPlan.findFirst({ where: { name: planName } });
    const planId = planRecord?.id || "00000000-0000-0000-0000-000000000000";

    // Create school subscription record
    await tx.schoolSubscription.create({
      data: {
        tenantId: tenant.id,
        planId,
        status: "TRIAL" as any,
        maxTeachers: 10,
        maxStudents: 100,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day trial
      },
    });

    return { tenant, user };
  });

  // Send welcome email
  await sendWelcomeEmail(
    dto.principalEmail,
    `${dto.principalFirstName} ${dto.principalLastName}`,
    `${env.WEB_URL}/login`
  );

  // Generate OTP for phone verification
  const otp = await createAndStoreOTP(result.user.phone);
  await sendOTPSMS(result.user.phone, otp);

  logger.info(`School registered: ${dto.schoolCode} | Principal: ${result.user.uniqueId}`);

  return {
    tenantId: result.tenant.id,
    schoolName: result.tenant.name,
    principalUniqueId: result.user.uniqueId,
    message: "School registered successfully. Please verify your phone with the OTP sent.",
  };
}

// ────────────────────────────────────────────────
// Login
// ────────────────────────────────────────────────

export async function loginUser(dto: LoginDTO) {
  if (!dto.uniqueId && !dto.email) {
    throw ApiError.badRequest("uniqueId or email is required", "LOGIN_MISSING_IDENTIFIER");
  }

  const user = await prisma.user.findFirst({
    where: dto.uniqueId ? { uniqueId: dto.uniqueId } : { email: dto.email },
    include: { tenant: true, principal: true, admin: true, teacher: true, student: true, parent: true },
  });

  if (!user) {
    throw ApiError.unauthorized("Invalid credentials", "INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Account is deactivated", "ACCOUNT_INACTIVE");
  }

  // Check account lock
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw ApiError.forbidden("Account is temporarily locked. Try again later.", "ACCOUNT_LOCKED");
  }

  const valid = await comparePassword(dto.password, user.passwordHash);
  if (!valid) {
    // Increment login attempts
    const updatedAttempts = user.loginAttempts + 1;
    const lockUntil = updatedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: updatedAttempts, lockUntil },
    });
    throw ApiError.unauthorized("Invalid credentials", "INVALID_CREDENTIALS");
  }

  // Reset login attempts on success
  await prisma.user.update({
    where: { id: user.id },
    data: { loginAttempts: 0, lockUntil: null, lastLoginAt: new Date() },
  });

  // If 2FA enabled, return partial response
  if (user.twoFactorEnabled && user.twoFactorSecret) {
    return {
      requires2FA: true,
      tempToken: signToken(
        { userId: user.id, role: user.role, tenantId: user.tenantId, uniqueId: user.uniqueId, type: "verify" },
        { expiresIn: "5m" }
      ),
      message: "2FA verification required",
    };
  }

  const tokens = generateTokenPair({
    id: user.id,
    role: user.role,
    tenantId: user.tenantId,
    uniqueId: user.uniqueId,
  });

  // Store refresh token hash in Redis (for revocation support)
  await redis.setex(`refresh:${user.id}:${tokens.refreshToken}`, 7 * 24 * 60 * 60, "1");

  // Log login history
  await prisma.loginHistory.create({
    data: {
      userId: user.id,
      ipAddress: "0.0.0.0", // passed from controller
      userAgent: "",        // passed from controller
      status: "SUCCESS" as any,
    },
  });

  return {
    user: sanitizeUser(user),
    tokens,
    message: "Login successful",
  };
}

// ────────────────────────────────────────────────
// Refresh Token
// ────────────────────────────────────────────────

export async function refreshAccessToken(refreshToken: string) {
  const decoded = verifyToken(refreshToken, "refresh");

  const exists = await redis.get(`refresh:${decoded.userId}:${refreshToken}`);
  if (!exists) {
    throw ApiError.unauthorized("Refresh token revoked or expired", "TOKEN_REVOKED");
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("User not found or inactive", "USER_INVALID");
  }

  const tokens = generateTokenPair({
    id: user.id,
    role: user.role,
    tenantId: user.tenantId,
    uniqueId: user.uniqueId,
  });

  // Rotate refresh token: delete old, store new
  await redis.del(`refresh:${user.id}:${refreshToken}`);
  await redis.setex(`refresh:${user.id}:${tokens.refreshToken}`, 7 * 24 * 60 * 60, "1");

  return { tokens, message: "Token refreshed successfully" };
}

// ────────────────────────────────────────────────
// Logout
// ────────────────────────────────────────────────

export async function logoutUser(userId: string, refreshToken: string) {
  await redis.del(`refresh:${userId}:${refreshToken}`);
  logger.info(`User logged out: ${userId}`);
  return { message: "Logged out successfully" };
}

// ────────────────────────────────────────────────
// Forgot Password
// ────────────────────────────────────────────────

export async function forgotPassword(identifier: string) {
  // identifier can be email or uniqueId
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { uniqueId: identifier }] },
  });

  if (!user || !user.isActive) {
    // Do not reveal whether user exists
    return { message: "If an account exists, a reset link has been sent." };
  }

  const resetToken = signToken(
    { userId: user.id, role: user.role, tenantId: user.tenantId, uniqueId: user.uniqueId, type: "reset" },
    { expiresIn: "1h" }
  );

  // Hash the token with crypto before storing
  const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  await redis.setex(`reset:${user.id}`, 3600, tokenHash);

  await sendPasswordResetEmail(user.email, resetToken, `${user.firstName} ${user.lastName}`);

  return { message: "If an account exists, a reset link has been sent." };
}

// ────────────────────────────────────────────────
// Reset Password
// ────────────────────────────────────────────────

export async function resetPassword(dto: ResetPasswordDTO) {
  const decoded = verifyToken(dto.token, "access"); // reset uses access secret but different validation
  if (decoded.type !== "reset") {
    throw ApiError.badRequest("Invalid reset token", "INVALID_RESET_TOKEN");
  }

  const tokenHash = crypto.createHash("sha256").update(dto.token).digest("hex");
  const stored = await redis.get(`reset:${decoded.userId}`);
  if (!stored || stored !== tokenHash) {
    throw ApiError.badRequest("Reset token expired or invalid", "RESET_TOKEN_INVALID");
  }

  const passwordHash = await hashPassword(dto.newPassword);
  await prisma.user.update({
    where: { id: decoded.userId },
    data: { passwordHash, passwordChangedAt: new Date() },
  });

  await redis.del(`reset:${decoded.userId}`);

  return { message: "Password reset successfully" };
}

// ────────────────────────────────────────────────
// Change Password
// ────────────────────────────────────────────────

export async function changePassword(dto: ChangePasswordDTO) {
  const user = await prisma.user.findUnique({ where: { id: dto.userId } });
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

  const valid = await comparePassword(dto.currentPassword, user.passwordHash);
  if (!valid) throw ApiError.badRequest("Current password is incorrect", "INVALID_CURRENT_PASSWORD");

  const passwordHash = await hashPassword(dto.newPassword);
  await prisma.user.update({
    where: { id: dto.userId },
    data: { passwordHash, passwordChangedAt: new Date() },
  });

  return { message: "Password changed successfully" };
}

// ────────────────────────────────────────────────
// Verify OTP
// ────────────────────────────────────────────────

export async function verifyPhoneOTP(phone: string, otp: string) {
  const valid = await verifyOTP(phone, otp);
  if (!valid) throw ApiError.badRequest("Invalid or expired OTP", "INVALID_OTP");

  const user = await prisma.user.findFirst({ where: { phone } });
  if (user && !user.isVerified) {
    await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
  }

  return { message: "Phone verified successfully" };
}

// ────────────────────────────────────────────────
// Resend OTP
// ────────────────────────────────────────────────

export async function resendOTP(phone: string) {
  const user = await prisma.user.findFirst({ where: { phone } });
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

  const otp = await createAndStoreOTP(phone);
  await sendOTPSMS(phone, otp);

  return { message: "OTP resent successfully" };
}

// ────────────────────────────────────────────────
// 2FA Setup
// ────────────────────────────────────────────────

export async function setup2FA(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

  const { authenticator } = require("otplib");
  const QRCode = require("qrcode");

  const secret = authenticator.generateSecret();
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret },
  });

  const otpauthUrl = authenticator.keyuri(user.email, "Acadivo", secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  return {
    message: "2FA setup initiated. Scan the QR code with your authenticator app.",
    secret,
    otpauthUrl,
    qrCodeDataUrl,
  };
}

// ────────────────────────────────────────────────
// Verify 2FA
// ────────────────────────────────────────────────

export async function verify2FA(userId: string, code: string, tempToken?: string) {
  let targetUserId = userId;
  if (tempToken) {
    const decoded = verifyToken(tempToken, "access");
    if (decoded.type !== "verify") throw ApiError.badRequest("Invalid verification token", "INVALID_VERIFY_TOKEN");
    targetUserId = decoded.userId;
  }

  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user || !user.twoFactorSecret) throw ApiError.badRequest("2FA not set up", "2FA_NOT_SETUP");

  const { authenticator } = require("otplib");
  const isValid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
  if (!isValid) {
    throw ApiError.badRequest("Invalid 2FA code", "INVALID_2FA_CODE");
  }

  // If this was a login verification, return tokens
  if (tempToken) {
    const tokens = generateTokenPair({
      id: user.id,
      role: user.role,
      tenantId: user.tenantId,
      uniqueId: user.uniqueId,
    });
    await redis.setex(`refresh:${user.id}:${tokens.refreshToken}`, 7 * 24 * 60 * 60, "1");
    return { tokens, user: sanitizeUser(user), message: "2FA verified. Login successful." };
  }

  // Enabling 2FA permanently
  await prisma.user.update({
    where: { id: targetUserId },
    data: { twoFactorEnabled: true },
  });

  return { message: "2FA enabled successfully" };
}

/**
 * Disable 2FA for a user.
 */
export async function disable2FA(userId: string, code: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorSecret) throw ApiError.badRequest("2FA not set up", "2FA_NOT_SETUP");

  const { authenticator } = require("otplib");
  const isValid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
  if (!isValid) {
    throw ApiError.badRequest("Invalid 2FA code", "INVALID_2FA_CODE");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  return { message: "2FA disabled successfully" };
}



// ────────────────────────────────────────────────
// Get / Update Profile
// ────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true, principal: true, admin: true, teacher: true, student: true, parent: true },
  });
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");
  return sanitizeUser(user);
}

export async function updateProfile(userId: string, dto: UpdateProfileDTO) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found", "USER_NOT_FOUND");

  let avatarUrl = user.avatar;
  if (dto.avatarFile) {
    avatarUrl = await uploadToCloudinary(dto.avatarFile, `acadivo/avatars/${user.tenantId}`);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: dto.firstName ?? user.firstName,
      lastName: dto.lastName ?? user.lastName,
      phone: dto.phone ?? user.phone,
      email: dto.email ?? user.email,
      address: dto.address ?? user.address,
      city: dto.city ?? user.city,
      gender: dto.gender ?? user.gender,
      avatar: avatarUrl,
    },
    include: { tenant: true, principal: true, admin: true, teacher: true, student: true, parent: true },
  });

  return sanitizeUser(updated);
}

// ────────────────────────────────────────────────
// Setup Parent Password
// ────────────────────────────────────────────────

export async function setupParentPassword(dto: SetupParentPasswordDTO) {
  const valid = await verifyOTP(dto.phone, dto.otp);
  if (!valid) throw ApiError.badRequest("Invalid or expired OTP", "INVALID_OTP");

  const user = await prisma.user.findFirst({
    where: { phone: dto.phone, role: UserRole.PARENT },
  });
  if (!user) throw ApiError.notFound("Parent not found", "PARENT_NOT_FOUND");

  const passwordHash = await hashPassword(dto.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, isVerified: true, passwordChangedAt: new Date() },
  });

  return { message: "Parent password set successfully. You can now log in." };
}

// ────────────────────────────────────────────────
// Sanitize User for Response
// ────────────────────────────────────────────────

function sanitizeUser(user: any) {
  const {
    passwordHash,
    twoFactorSecret,
    loginAttempts,
    lockUntil,
    ...safe
  } = user;
  return safe;
}
