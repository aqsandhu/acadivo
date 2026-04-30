/**
 * @file src/modules/super-admin/super-admin.service.ts
 * @description Business logic for Super Admin platform management.
 */

import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";
import { redis } from "../../config/redis";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { buildPaginationMeta, getPagination } from "../../utils/pagination";
import { hashPassword } from "../../utils/password";
import { sendWelcomeEmail } from "../../utils/email";
import { createAndStoreOTP } from "../../utils/otp";
import { sendOTPSMS } from "../../utils/sms";
import { logger } from "../../utils/logger";
import {
  UserRole,
  TenantStatus,
  TenantType,
  SubscriptionPlan,
  AdStatus,
  AdTargetAudience,
  SchoolSubscriptionStatus,
  FeeStatus,
} from "@prisma/client";
import type { UploadFile } from "../../utils/upload";
import { uploadToCloudinary } from "../../utils/upload";

// ── DTOs ──

export interface OnboardSchoolDTO {
  name: string;
  code: string;
  type: TenantType;
  city: string;
  address: string;
  phone: string;
  email: string;
  principalFirstName: string;
  principalLastName: string;
  principalEmail: string;
  principalPhone: string;
  principalPassword: string;
  subscriptionPlan: SubscriptionPlan;
  maxTeachers?: number;
  maxStudents?: number;
  logoFile?: UploadFile;
}

export interface UpdateSchoolDTO {
  name?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  subscriptionPlan?: SubscriptionPlan;
  maxTeachers?: number;
  maxStudents?: number;
  logoFile?: UploadFile;
}

export interface CreateAdDTO {
  title: string;
  description: string;
  imageFile?: UploadFile;
  targetAudience: AdTargetAudience;
  linkUrl?: string;
  startDate?: Date;
  endDate?: Date;
  maxImpressions?: number;
  maxClicks?: number;
}

export interface UpdateAdDTO {
  title?: string;
  description?: string;
  imageFile?: UploadFile;
  targetAudience?: AdTargetAudience;
  linkUrl?: string;
  startDate?: Date;
  endDate?: Date;
  maxImpressions?: number;
  maxClicks?: number;
  status?: AdStatus;
}

export interface AnnouncementDTO {
  title: string;
  content: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
}

export interface ListSchoolsFilters {
  status?: TenantStatus;
  city?: string;
  plan?: SubscriptionPlan;
  search?: string;
  page: number;
  limit: number;
}

export interface ListUsersFilters {
  role?: UserRole;
  tenantId?: string;
  search?: string;
  page: number;
  limit: number;
}

// ── Dashboard ──

export async function getDashboardStats() {
  const [
    totalSchools,
    totalUsers,
    totalMessages,
    activeToday,
    pendingSchools,
    activeSubscriptions,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.message.count(),
    prisma.user.count({
      where: { lastLoginAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    prisma.tenant.count({ where: { status: TenantStatus.PENDING } }),
    prisma.schoolSubscription.count({ where: { status: SchoolSubscriptionStatus.ACTIVE } }),
  ]);

  return {
    totalSchools,
    totalUsers,
    totalMessages,
    activeToday,
    pendingSchools,
    activeSubscriptions,
  };
}

// ── Schools ──

export async function listSchools(filters: ListSchoolsFilters) {
  const where: Prisma.TenantWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.city) where.city = { contains: filters.city, mode: "insensitive" };
  if (filters.plan) where.subscriptionPlan = filters.plan;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { code: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const total = await prisma.tenant.count({ where });
  const { skip, limit, page } = getPagination({ page: filters.page, limit: filters.limit }, total);

  const schools = await prisma.tenant.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true, students: true, teachers: true } },
      schoolSubscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return {
    data: schools,
    meta: buildPaginationMeta(page, limit, total),
  };
}

export async function getSchoolById(id: string) {
  const school = await prisma.tenant.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true, students: true, teachers: true, parents: true, classes: true } },
      schoolSubscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      users: {
        where: { role: UserRole.PRINCIPAL },
        select: { id: true, uniqueId: true, email: true, firstName: true, lastName: true, phone: true },
      },
    },
  });
  if (!school) throw ApiError.notFound("School not found", "SCHOOL_NOT_FOUND");
  return school;
}

export async function onboardSchool(dto: OnboardSchoolDTO, createdBy: string) {
  const existing = await prisma.tenant.findUnique({ where: { code: dto.code } });
  if (existing) throw ApiError.conflict("School code already exists", "SCHOOL_CODE_EXISTS");

  const existingEmail = await prisma.user.findFirst({ where: { email: dto.principalEmail } });
  if (existingEmail) throw ApiError.conflict("Principal email already registered", "EMAIL_EXISTS");

  let logoUrl: string | null = null;
  if (dto.logoFile) {
    logoUrl = await uploadToCloudinary(dto.logoFile, "acadivo/school-logos");
  }

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: dto.name,
        code: dto.code,
        type: dto.type,
        city: dto.city,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        logo: logoUrl,
        status: TenantStatus.ACTIVE,
        subscriptionPlan: dto.subscriptionPlan,
        maxTeachers: dto.maxTeachers ?? 10,
        maxStudents: dto.maxStudents ?? 100,
        createdBy,
      },
    });

    const uniqueId = `PR-${dto.code}-0001`;
    const passwordHash = await hashPassword(dto.principalPassword);

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
        isVerified: true,
      },
    });

    await tx.principal.create({
      data: { userId: user.id, tenantId: tenant.id },
    });

    // Resolve subscription plan ID
    const planRecord = await tx.platformPlan.findFirst({ where: { name: dto.subscriptionPlan } });
    const planId = planRecord?.id || "00000000-0000-0000-0000-000000000000";

    await tx.schoolSubscription.create({
      data: {
        tenantId: tenant.id,
        planId,
        status: SchoolSubscriptionStatus.ACTIVE,
        maxTeachers: dto.maxTeachers ?? 10,
        maxStudents: dto.maxStudents ?? 100,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    return { tenant, user };
  });

  await sendWelcomeEmail(
    dto.principalEmail,
    `${dto.principalFirstName} ${dto.principalLastName}`,
    `${env.WEB_URL}/login`
  );

  logger.info(`SuperAdmin onboarded school: ${dto.code}`);
  return result.tenant;
}

export async function updateSchool(id: string, dto: UpdateSchoolDTO) {
  const school = await prisma.tenant.findUnique({ where: { id } });
  if (!school) throw ApiError.notFound("School not found", "SCHOOL_NOT_FOUND");

  let logoUrl = school.logo;
  if (dto.logoFile) {
    logoUrl = await uploadToCloudinary(dto.logoFile, "acadivo/school-logos");
  }

  const updated = await prisma.tenant.update({
    where: { id },
    data: {
      name: dto.name,
      city: dto.city,
      address: dto.address,
      phone: dto.phone,
      email: dto.email,
      subscriptionPlan: dto.subscriptionPlan,
      maxTeachers: dto.maxTeachers,
      maxStudents: dto.maxStudents,
      logo: logoUrl,
    },
  });

  return updated;
}

export async function updateSchoolStatus(id: string, status: TenantStatus) {
  const school = await prisma.tenant.findUnique({ where: { id } });
  if (!school) throw ApiError.notFound("School not found", "SCHOOL_NOT_FOUND");

  const updated = await prisma.tenant.update({
    where: { id },
    data: { status },
  });

  // Cascade deactivate users if suspended
  if (status === TenantStatus.SUSPENDED) {
    await prisma.user.updateMany({
      where: { tenantId: id },
      data: { isActive: false },
    });
  } else if (status === TenantStatus.ACTIVE) {
    await prisma.user.updateMany({
      where: { tenantId: id },
      data: { isActive: true },
    });
  }

  logger.info(`School ${id} status changed to ${status}`);
  return updated;
}

export async function softDeleteSchool(id: string) {
  const school = await prisma.tenant.findUnique({ where: { id } });
  if (!school) throw ApiError.notFound("School not found", "SCHOOL_NOT_FOUND");

  // Soft delete by marking inactive
  await prisma.tenant.update({ where: { id }, data: { status: TenantStatus.SUSPENDED } });
  await prisma.user.updateMany({ where: { tenantId: id }, data: { isActive: false } });

  logger.info(`School soft-deleted: ${id}`);
  return { message: "School deactivated successfully" };
}

// ── Subscriptions ──

export async function listSubscriptions(page: number, limit: number) {
  const total = await prisma.schoolSubscription.count();
  const { skip, limit: take, page: currentPage } = getPagination({ page, limit }, total);

  const subs = await prisma.schoolSubscription.findMany({
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: { tenant: { select: { name: true, code: true } } },
  });

  return { data: subs, meta: buildPaginationMeta(currentPage, take, total) };
}

export async function updateSubscription(id: string, data: any) {
  const sub = await prisma.schoolSubscription.findUnique({ where: { id } });
  if (!sub) throw ApiError.notFound("Subscription not found", "SUBSCRIPTION_NOT_FOUND");

  let planId: string | undefined;
  if (data.plan) {
    const planRecord = await prisma.platformPlan.findFirst({ where: { name: data.plan } });
    planId = planRecord?.id;
  }

  const updated = await prisma.schoolSubscription.update({
    where: { id },
    data: {
      planId,
      status: data.status,
      maxTeachers: data.maxTeachers,
      maxStudents: data.maxStudents,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
  });

  // Sync tenant plan enum
  if (data.plan) {
    await prisma.tenant.update({
      where: { id: sub.tenantId },
      data: { subscriptionPlan: data.plan },
    });
  }

  return updated;
}

// ── Analytics ──

export async function getPlatformAnalytics(period: "7d" | "30d" | "90d" | "1y" = "30d") {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    newSchools,
    newUsers,
    newMessages,
    totalRevenueAgg,
    activeUsers,
  ] = await Promise.all([
    prisma.tenant.count({ where: { createdAt: { gte: since } } }),
    prisma.user.count({ where: { createdAt: { gte: since } } }),
    prisma.message.count({ where: { createdAt: { gte: since } } }),
    prisma.feeRecord.aggregate({
      where: { createdAt: { gte: since }, status: FeeStatus.PAID },
      _sum: { paidAmount: true },
    }),
    prisma.user.count({ where: { lastLoginAt: { gte: since } } }),
  ]);

  const totalRevenue = totalRevenueAgg._sum.paidAmount
    ? Number(totalRevenueAgg._sum.paidAmount)
    : 0;

  return {
    period,
    newSchools,
    newUsers,
    newMessages,
    totalRevenue,
    activeUsers,
    totalSchools: await prisma.tenant.count(),
    totalUsers: await prisma.user.count(),
  };
}

// ── Users ──

export async function listAllUsers(filters: ListUsersFilters) {
  const where: Prisma.UserWhereInput = {};
  if (filters.role) where.role = filters.role;
  if (filters.tenantId) where.tenantId = filters.tenantId;
  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: "insensitive" } },
      { lastName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { uniqueId: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const total = await prisma.user.count({ where });
  const { skip, limit, page } = getPagination({ page: filters.page, limit: filters.limit }, total);

  const users = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { tenant: { select: { name: true, code: true } } },
  });

  return {
    data: users.map((u) => {
      const { passwordHash, twoFactorSecret, ...safe } = u as any;
      return safe;
    }),
    meta: buildPaginationMeta(page, limit, total),
  };
}

// ── Announcements ──

export async function createSystemAnnouncement(dto: AnnouncementDTO, postedBy: string) {
  // System-wide announcements have tenantId = "system" or a special sentinel
  // For this schema tenantId is required string, so we use a system tenant concept
  // or store in a separate table. Here we use the first SUPER_ADMIN tenant if exists,
  // otherwise create a system tenant on first run. For simplicity, we'll use a fixed system tenant ID.
  const SYSTEM_TENANT_ID = "00000000-0000-0000-0000-000000000000";

  const announcement = await prisma.announcement.create({
    data: {
      tenantId: SYSTEM_TENANT_ID,
      postedBy,
      title: dto.title,
      content: dto.content,
      priority: (dto.priority as any) || "NORMAL",
      targetAudience: "ALL",
    },
  });

  return announcement;
}

// ── Advertisements ──

export async function listAds(page: number, limit: number, status?: AdStatus) {
  const where: any = {};
  if (status) where.status = status;

  const total = await prisma.advertisement.count({ where });
  const { skip, limit: take, page: currentPage } = getPagination({ page, limit }, total);

  const ads = await prisma.advertisement.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { impressions: true } },
      creator: { select: { firstName: true, lastName: true } },
    },
  });

  return { data: ads, meta: buildPaginationMeta(currentPage, take, total) };
}

export async function getAdById(id: string) {
  const ad = await prisma.advertisement.findUnique({
    where: { id },
    include: {
      impressions: {
        select: { type: true, createdAt: true, userId: true },
        orderBy: { createdAt: "desc" },
        take: 1000,
      },
      creator: { select: { firstName: true, lastName: true } },
    },
  });
  if (!ad) throw ApiError.notFound("Advertisement not found", "AD_NOT_FOUND");
  return ad;
}

export async function createAd(dto: CreateAdDTO, creatorId: string) {
  let imageUrl: string | null = null;
  if (dto.imageFile) {
    imageUrl = await uploadToCloudinary(dto.imageFile, "acadivo/ads");
  }

  const ad = await prisma.advertisement.create({
    data: {
      title: dto.title,
      description: dto.description,
      imageUrl,
      targetAudience: dto.targetAudience,
      linkUrl: dto.linkUrl || null,
      startDate: dto.startDate || new Date(),
      endDate: dto.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: AdStatus.PENDING,
      maxImpressions: dto.maxImpressions || null,
      maxClicks: dto.maxClicks || null,
      createdBy: creatorId,
    },
  });

  return ad;
}

export async function updateAd(id: string, dto: UpdateAdDTO) {
  const ad = await prisma.advertisement.findUnique({ where: { id } });
  if (!ad) throw ApiError.notFound("Advertisement not found", "AD_NOT_FOUND");

  let imageUrl = ad.imageUrl;
  if (dto.imageFile) {
    imageUrl = await uploadToCloudinary(dto.imageFile, "acadivo/ads");
  }

  const updated = await prisma.advertisement.update({
    where: { id },
    data: {
      title: dto.title,
      description: dto.description,
      imageUrl,
      targetAudience: dto.targetAudience,
      linkUrl: dto.linkUrl,
      startDate: dto.startDate,
      endDate: dto.endDate,
      maxImpressions: dto.maxImpressions,
      maxClicks: dto.maxClicks,
      status: dto.status,
    },
  });

  return updated;
}

export async function deleteAd(id: string) {
  const ad = await prisma.advertisement.findUnique({ where: { id } });
  if (!ad) throw ApiError.notFound("Advertisement not found", "AD_NOT_FOUND");

  await prisma.advertisement.delete({ where: { id } });
  return { message: "Advertisement deleted successfully" };
}

export async function getAdStats(id: string) {
  const ad = await prisma.advertisement.findUnique({
    where: { id },
    include: {
      _count: { select: { impressions: true } },
      impressions: { select: { type: true } },
    },
  });
  if (!ad) throw ApiError.notFound("Advertisement not found", "AD_NOT_FOUND");

  const views = ad.impressions.filter((i) => i.type === "VIEW").length;
  const clicks = ad.impressions.filter((i) => i.type === "CLICK").length;

  return {
    adId: id,
    totalImpressions: ad._count.impressions,
    views,
    clicks,
    ctr: views > 0 ? (clicks / views) * 100 : 0,
  };
}

export async function toggleAdStatus(id: string) {
  const ad = await prisma.advertisement.findUnique({ where: { id } });
  if (!ad) throw ApiError.notFound("Advertisement not found", "AD_NOT_FOUND");

  const newStatus = ad.status === AdStatus.ACTIVE ? AdStatus.PENDING : AdStatus.ACTIVE;
  const updated = await prisma.advertisement.update({
    where: { id },
    data: { status: newStatus },
  });

  return { status: updated.status, message: `Ad is now ${updated.status}` };
}

// ── Bulk User Creation ──

export interface BulkUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  tenantId: string;
  password?: string;
  gender?: string;
}

export async function bulkCreateUsers(users: BulkUserInput[]) {
  if (!Array.isArray(users) || users.length === 0) {
    throw ApiError.badRequest("Expected non-empty array of users", "EMPTY_USERS_ARRAY");
  }
  if (users.length > 500) {
    throw ApiError.badRequest("Maximum 500 users per batch", "BATCH_TOO_LARGE");
  }

  const result = { success: 0, failed: 0, errors: [] as { index: number; error: string }[], created: [] as { id: string; email: string }[] };

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    try {
      const tenant = await prisma.tenant.findUnique({ where: { id: u.tenantId }, select: { code: true } });
      if (!tenant) {
        result.failed++;
        result.errors.push({ index: i, error: "Tenant not found" });
        continue;
      }

      const existing = await prisma.user.findFirst({ where: { email: u.email, tenantId: u.tenantId } });
      if (existing) {
        result.failed++;
        result.errors.push({ index: i, error: "Email already exists in this tenant" });
        continue;
      }

      const passwordHash = await hashPassword(u.password || "Acadivo@123");
      const rolePrefix = u.role.substring(0, 2).toUpperCase();
      const uniqueId = `${rolePrefix}-${tenant.code}-${Date.now().toString(36).toUpperCase()}-${String(i + 1).padStart(3, "0")}`;

      const user = await prisma.user.create({
        data: {
          uniqueId,
          email: u.email,
          passwordHash,
          role: u.role,
          tenantId: u.tenantId,
          firstName: u.firstName,
          lastName: u.lastName,
          phone: u.phone || "",
          gender: (u.gender as any) || undefined,
          isVerified: true,
        },
      });

      // Create role-specific profile
      if (u.role === "STUDENT") {
        await prisma.student.create({
          data: { userId: user.id, tenantId: u.tenantId, rollNumber: uniqueId, classId: "", sectionId: "", guardianName: "", guardianPhone: "", guardianRelation: "GUARDIAN" },
        });
      } else if (u.role === "TEACHER") {
        await prisma.teacher.create({ data: { userId: user.id, tenantId: u.tenantId } });
      } else if (u.role === "PARENT") {
        await prisma.parent.create({ data: { userId: user.id, tenantId: u.tenantId } });
      } else if (u.role === "PRINCIPAL") {
        await prisma.principal.create({ data: { userId: user.id, tenantId: u.tenantId } });
      } else if (u.role === "ADMIN") {
        await prisma.schoolAdmin.create({ data: { userId: user.id, tenantId: u.tenantId } });
      }

      result.success++;
      result.created.push({ id: user.id, email: user.email });

      // Fire-and-forget welcome email
      sendWelcomeEmail(u.email, `${u.firstName} ${u.lastName}`, `${env.WEB_URL}/login`).catch(() => {});
    } catch (err: any) {
      result.failed++;
      result.errors.push({ index: i, error: err.message });
    }
  }

  logger.info(`Bulk user creation: ${result.success} success, ${result.failed} failed`);
  return result;
}

// ── System-wide Settings ──

const SYSTEM_TENANT_ID = "00000000-0000-0000-0000-000000000000";

export async function getSystemSettings() {
  // Get settings from the system tenant
  const settings = await prisma.setting.findMany({
    where: { tenantId: SYSTEM_TENANT_ID },
    orderBy: { category: "asc" },
  });

  // Also return computed stats
  const [totalUsers, totalTenants, totalMessages] = await Promise.all([
    prisma.user.count(),
    prisma.tenant.count(),
    prisma.message.count(),
  ]);

  return {
    settings,
    stats: { totalUsers, totalTenants, totalMessages },
  };
}

export async function updateSystemSetting(key: string, value: string, category: string = "GENERAL") {
  const setting = await prisma.setting.upsert({
    where: {
      tenantId_key: {
        tenantId: SYSTEM_TENANT_ID,
        key,
      },
    },
    create: {
      tenantId: SYSTEM_TENANT_ID,
      key,
      value,
      category: category as any,
    },
    update: {
      value,
      category: category as any,
    },
  });

  return setting;
}

export async function deleteSystemSetting(key: string) {
  await prisma.setting.delete({
    where: {
      tenantId_key: {
        tenantId: SYSTEM_TENANT_ID,
        key,
      },
    },
  });
  return { message: "Setting deleted" };
}
