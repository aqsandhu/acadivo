// ═══════════════════════════════════════════════════
// Shared User Service — CRUD with Atomic Auto ID Generation
// ═══════════════════════════════════════════════════

import { PrismaClient, User, UserRole, Prisma } from '@prisma/client';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  tenantId: string;
  uniqueId?: string; // if not provided, auto-generated
  cnic?: string;
  avatar?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  cnic?: string;
  avatar?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  isActive?: boolean;
}

// ── Atomic ID generation ──

const ROLE_PREFIX: Record<string, string> = {
  SUPER_ADMIN: 'SA',
  PRINCIPAL: 'PR',
  ADMIN: 'AD',
  TEACHER: 'TC',
  STUDENT: 'ACD',
  PARENT: 'ACD',
};

/**
 * Atomically generate the next unique ID using a sequence counter.
 * Uses Prisma transaction with raw query to prevent race conditions.
 * Format: PREFIX-SCHOOLCODE-### (e.g., ACD-SCH001-001)
 * Student and Parent share the same ID prefix and sequence (ACD).
 */
export async function generateUniqueId(
  prisma: PrismaClient,
  role: UserRole,
  tenantId: string,
  schoolCode?: string
): Promise<string> {
  const prefix = ROLE_PREFIX[role] || 'USR';
  const code = schoolCode || tenantId.slice(0, 6).toUpperCase();

  // STUDENT and PARENT share the same ACD prefix and sequence
  const isSharedRole = role === 'STUDENT' || role === 'PARENT';

  return prisma.$transaction(async (tx) => {
    // Acquire advisory lock for this tenant+role combination
    const lockId = isSharedRole ? `uid_${tenantId}_ACD` : `uid_${tenantId}_${role}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockId}))`;

    // Count existing users with this role in this tenant (excluding soft-deleted)
    let count = 0;
    if (isSharedRole) {
      // Count BOTH students and parents for shared ACD sequence
      const [studentCount, parentCount] = await Promise.all([
        tx.student.count({ where: { tenantId, status: 'ACTIVE' } }),
        tx.parent.count({ where: { tenantId, user: { isActive: true } } }),
      ]);
      count = studentCount + parentCount;
    } else {
      switch (role) {
        case 'TEACHER':
          count = await tx.teacher.count({ where: { tenantId, user: { isActive: true } } });
          break;
        case 'ADMIN':
          count = await tx.schoolAdmin.count({ where: { tenantId, user: { isActive: true } } });
          break;
        case 'PRINCIPAL':
          count = await tx.principal.count({ where: { tenantId, user: { isActive: true } } });
          break;
        default:
          count = await tx.user.count({ where: { tenantId, role, isActive: true } });
      }
    }

    // Atomically increment a sequence stored in Redis for extra safety
    let seq = count + 1;
    try {
      const { redis } = require('../../config/redis');
      const redisKey = isSharedRole ? `seq:${tenantId}:ACD` : `seq:${tenantId}:${role}`;
      const redisSeq = await redis.incr(redisKey);
      if (redisSeq > seq) seq = redisSeq;
      else await redis.set(redisKey, seq);
    } catch {
      // Redis unavailable, fall back to count-based
    }

    return `${prefix}-${code}-${String(seq).padStart(3, '0')}`;
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });
}

// ── Create User ──

export async function createUser(
  prisma: PrismaClient,
  data: CreateUserData,
  schoolCode?: string
): Promise<User> {
  const uniqueId = data.uniqueId || (await generateUniqueId(prisma, data.role, data.tenantId, schoolCode));

  const user = await prisma.user.create({
    data: {
      ...data,
      uniqueId,
    },
  });

  return user;
}

// ── Update User ──

export async function updateUser(
  prisma: PrismaClient,
  userId: string,
  data: UpdateUserData
): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

// ── Find User by ID (with role profile) ──

export async function findUserById(
  prisma: PrismaClient,
  userId: string,
  tenantId: string
): Promise<User | null> {
  return prisma.user.findFirst({
    where: { id: userId, tenantId },
  });
}

// ── Find User by uniqueId ──

export async function findUserByUniqueId(
  prisma: PrismaClient,
  uniqueId: string,
  tenantId: string
): Promise<User | null> {
  return prisma.user.findFirst({
    where: { uniqueId, tenantId },
  });
}

// ── List Users ──

export interface ListUsersOptions {
  tenantId: string;
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function listUsers(
  prisma: PrismaClient,
  options: ListUsersOptions
): Promise<{ users: User[]; total: number }> {
  const { tenantId, role, isActive, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  const where: Prisma.UserWhereInput = { tenantId };
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { uniqueId: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}

// ── Deactivate / Reactivate ──

export async function setUserActive(
  prisma: PrismaClient,
  userId: string,
  isActive: boolean
): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });
}
