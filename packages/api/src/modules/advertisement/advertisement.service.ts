import { AdStatus, AdTargetAudience, AdImpressionType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../lib/ApiError";



// ──────────────────────────────────────────────
// Public Ad Service (for users)
// ──────────────────────────────────────────────

export async function getActiveAds(
  userRole: string,
  city?: string,
  schoolType?: string,
  page = 1,
  pageSize = 10
) {
  const now = new Date();

  // Map user role to target audience
  const roleToAudience: Record<string, AdTargetAudience> = {
    STUDENT: "STUDENTS",
    PARENT: "PARENTS",
    TEACHER: "TEACHERS",
    PRINCIPAL: "PRINCIPALS",
    ADMIN: "ADMIN",
    SUPER_ADMIN: "ADMIN",
  };

  const userAudience = roleToAudience[userRole] || "ALL";

  const where: Record<string, unknown> = {
    status: "ACTIVE",
    startDate: { lte: now },
    endDate: { gte: now },
    OR: [
      { targetAudience: "ALL" },
      { targetAudience: userAudience },
    ],
  };

  if (city) {
    where.targetCities = { path: [], array_contains: city };
  }
  if (schoolType) {
    where.targetSchoolTypes = { path: [], array_contains: schoolType };
  }

  const [ads, totalCount] = await Promise.all([
    prisma.advertisement.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        linkUrl: true,
        targetAudience: true,
        priority: true,
        startDate: true,
        endDate: true,
        impressionCount: true,
        clickCount: true,
      },
    }),
    prisma.advertisement.count({ where }),
  ]);

  return { ads, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function getAdById(id: string) {
  const ad = await prisma.advertisement.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      linkUrl: true,
      targetAudience: true,
      targetCities: true,
      targetSchoolTypes: true,
      startDate: true,
      endDate: true,
      priority: true,
      status: true,
      impressionCount: true,
      clickCount: true,
      createdBy: true,
      createdAt: true,
    },
  });
  if (!ad) throw ApiError.notFound("Advertisement not found");
  return ad;
}

export async function trackImpression(
  adId: string,
  userId: string,
  tenantId: string,
  studentId?: string
) {
  const ad = await prisma.advertisement.findUnique({ where: { id: adId } });
  if (!ad) throw ApiError.notFound("Advertisement not found");

  await prisma.$transaction([
    prisma.adImpression.create({
      data: {
        adId,
        userId,
        tenantId,
        studentId,
        impressionType: "VIEW",
      },
    }),
    prisma.advertisement.update({
      where: { id: adId },
      data: { impressionCount: { increment: 1 } },
    }),
  ]);

  return { tracked: true };
}

export async function trackClick(
  adId: string,
  userId: string,
  tenantId: string,
  studentId?: string
) {
  const ad = await prisma.advertisement.findUnique({ where: { id: adId } });
  if (!ad) throw ApiError.notFound("Advertisement not found");

  await prisma.$transaction([
    prisma.adImpression.create({
      data: {
        adId,
        userId,
        tenantId,
        studentId,
        impressionType: "CLICK",
      },
    }),
    prisma.advertisement.update({
      where: { id: adId },
      data: { clickCount: { increment: 1 } },
    }),
  ]);

  return { tracked: true };
}

// ──────────────────────────────────────────────
// Super Admin Ad Management Service
// ──────────────────────────────────────────────

export async function getAllAds(
  filters: {
    status?: AdStatus;
    search?: string;
    page?: number;
    pageSize?: number;
  }
) {
  const { status, search, page = 1, pageSize = 20 } = filters;
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [ads, totalCount] = await Promise.all([
    prisma.advertisement.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        createdByUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { impressions: true } },
      },
    }),
    prisma.advertisement.count({ where }),
  ]);

  return { ads, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function createAd(
  createdBy: string,
  data: {
    title: string;
    description: string;
    imageUrl?: string;
    linkUrl?: string;
    targetAudience?: AdTargetAudience;
    targetCities?: string[];
    targetSchoolTypes?: string[];
    startDate: string;
    endDate: string;
    priority?: number;
    status?: AdStatus;
  }
) {
  return prisma.advertisement.create({
    data: {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      targetAudience: data.targetAudience || "ALL",
      targetCities: data.targetCities,
      targetSchoolTypes: data.targetSchoolTypes,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      priority: data.priority || 0,
      status: data.status || "PENDING",
      createdBy,
    },
  });
}

export async function updateAd(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    imageUrl: string;
    linkUrl: string;
    targetAudience: AdTargetAudience;
    targetCities: string[];
    targetSchoolTypes: string[];
    startDate: string;
    endDate: string;
    priority: number;
    status: AdStatus;
  }>
) {
  const ad = await prisma.advertisement.findUnique({ where: { id } });
  if (!ad) throw ApiError.notFound("Advertisement not found");

  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl;
  if (data.targetAudience !== undefined) updateData.targetAudience = data.targetAudience;
  if (data.targetCities !== undefined) updateData.targetCities = data.targetCities;
  if (data.targetSchoolTypes !== undefined) updateData.targetSchoolTypes = data.targetSchoolTypes;
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.status !== undefined) updateData.status = data.status;

  return prisma.advertisement.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteAd(id: string) {
  const ad = await prisma.advertisement.findUnique({ where: { id } });
  if (!ad) throw ApiError.notFound("Advertisement not found");

  await prisma.adImpression.deleteMany({ where: { adId: id } });
  await prisma.advertisement.delete({ where: { id } });
  return { deleted: true };
}

export async function updateAdStatus(id: string, status: AdStatus) {
  const ad = await prisma.advertisement.findUnique({ where: { id } });
  if (!ad) throw ApiError.notFound("Advertisement not found");

  return prisma.advertisement.update({
    where: { id },
    data: { status },
  });
}

export async function getAdStats(id: string) {
  const ad = await prisma.advertisement.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      impressionCount: true,
      clickCount: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  });
  if (!ad) throw ApiError.notFound("Advertisement not found");

  // Breakdown by impression type
  const impressionsByType = await prisma.adImpression.groupBy({
    by: ["impressionType"],
    where: { adId: id },
    _count: { id: true },
  });

  const viewCount = impressionsByType.find((i) => i.impressionType === "VIEW")?._count.id || 0;
  const clickCount = impressionsByType.find((i) => i.impressionType === "CLICK")?._count.id || 0;

  // Breakdown by day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyStats = await prisma.adImpression.groupBy({
    by: ["impressionType", "createdAt"],
    where: {
      adId: id,
      createdAt: { gte: thirtyDaysAgo },
    },
    _count: { id: true },
  });

  const ctr = ad.impressionCount > 0 ? (ad.clickCount / ad.impressionCount) * 100 : 0;

  return {
    ad,
    stats: {
      impressions: ad.impressionCount,
      clicks: ad.clickCount,
      views: viewCount,
      clickEvents: clickCount,
      ctr: parseFloat(ctr.toFixed(2)),
    },
    dailyStats,
  };
}
